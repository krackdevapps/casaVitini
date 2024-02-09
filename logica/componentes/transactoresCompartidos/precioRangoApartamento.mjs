
import { DateTime } from 'luxon';
import { conexion } from '../db.mjs';
import Decimal from 'decimal.js';
import { aplicarImpuestos } from './aplicarImpuestos.mjs';

// Pasas una fecha de entrad un fecha de salida y un apartmaento y te da todos el tema
const constructorObjetoEstructuraPrecioDia = (fechaEntrada_ISO, fechaSalida_ISO) => {
    const arregloFechas = [];
    let fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO); // Convertir la fecha de entrada a un objeto DateTime
    const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO)

    while (fechaEntrada_Objeto <= fechaSalida_Objeto) {
        arregloFechas.push(fechaEntrada_Objeto.toISODate());
        fechaEntrada_Objeto = fechaEntrada_Objeto.plus({ days: 1 }); // Avanzar al siguiente día
    }
    return arregloFechas;
}
const verificarFechaEnRango = (fechaEntrada_ISO, fechaSalida_ISO, fechaEspecifica_ISO) => {

    const fechaInicio = DateTime.fromISO(fechaEntrada_ISO);
    const fechaFin = DateTime.fromISO(fechaSalida_ISO);
    const fechaVerificar = DateTime.fromISO(fechaEspecifica_ISO);
    return fechaVerificar >= fechaInicio && fechaVerificar <= fechaFin;
}

const resolverComportamientosDePrecio = async (fechaEntrada_ISO, fechaSalida_ISO) => {
    const estructuraComportamientos = []
    const soloComportamientosActivados = "activado"
    const buscarComportamientoPrecio = `
    SELECT
    uid,
    "nombreComportamiento",
    to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
    to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal"
    FROM "comportamientoPrecios" 
    WHERE "fechaInicio" <= $1::DATE AND "fechaFinal" >= $2::DATE AND estado = $3;`
    const resuelveBuscarComportamientoPrecio = await conexion.query(buscarComportamientoPrecio, [fechaSalida_ISO, fechaEntrada_ISO, soloComportamientosActivados])

    if (resuelveBuscarComportamientoPrecio.rowCount > 0) {
        const comportamientoEntonctrados = resuelveBuscarComportamientoPrecio.rows
        for (const detallesComportamiento of comportamientoEntonctrados) {
            const uidComportamiento = detallesComportamiento.uid
            const nombreComportamiento = detallesComportamiento.nombreComportamiento
            const fechaInicioComportamiento = detallesComportamiento.fechaInicio
            const fechaFinalComportamiento = detallesComportamiento.fechaFinal

            const buscarApartamentosEnComportamiento = `
            SELECT 
            "apartamentoIDV",
            simbolo,
            cantidad
            FROM "comportamientoPreciosApartamentos" 
            WHERE "comportamientoUID" = $1;`
            const resuelveBuscarApartamentosEnComortamiento = await conexion.query(buscarApartamentosEnComportamiento, [uidComportamiento])

            if (resuelveBuscarApartamentosEnComortamiento.rowCount > 0) {
                const apartamentoEntonctradoEnComportamiento = resuelveBuscarApartamentosEnComortamiento.rows

                for (const perfilComportamiento of apartamentoEntonctradoEnComportamiento) {
                    const simbolo = perfilComportamiento.simbolo
                    const cantidad = perfilComportamiento.cantidad
                    const apartamentoIDVComportamiento = perfilComportamiento.apartamentoIDV

                    const constructorFaseUno = {
                        apartamentoIDV: apartamentoIDVComportamiento,
                        simbolo: simbolo,
                        nombreComportamiento: nombreComportamiento,
                        cantidad: cantidad,
                        fechaInicio: fechaInicioComportamiento,
                        fechaFinal: fechaFinalComportamiento,
                    }
                    estructuraComportamientos.push(constructorFaseUno)
                }

            }
        }
    }
    return estructuraComportamientos
}

const precioRangoApartamento = async (metadatos) => {
    try {
        const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
        const fechaSalida_ISO = metadatos.fechaSalida_ISO
        const apartamentosIDVArreglo = metadatos.apartamentosIDVArreglo

        const estructuraArregloDiasEnEspera = constructorObjetoEstructuraPrecioDia(fechaEntrada_ISO, fechaSalida_ISO);
        
        const comportamientoEntonctradosPorProcesar = []
        const desglosePreciosBaseApartamentos = []
        const estructuraFinal = {}
        estructuraFinal.totalesPorNoche_Objeto = {}
        estructuraFinal.totalesPorApartamento_Objeto = {}
        estructuraFinal.metadatos = {}
        let totalPrecioNeto = 0

        for (const apartamentoIDVGlobal of apartamentosIDVArreglo) {
            const consultaPrecios = `
            SELECT
            pc.precio,
            pc.moneda, 
            pc.apartamento AS "apartamentoIDV",
            a."apartamentoUI"
            FROM
            "preciosApartamentos" pc
            JOIN
            apartamentos a ON pc.apartamento = a.apartamento
            WHERE
            a.apartamento = $1;`
            const resuelveConsutaPrecios = await conexion.query(consultaPrecios, [apartamentoIDVGlobal])
            if (resuelveConsutaPrecios.rowCount == 0) {
                const error = "No existe el apartamento, revisa el apartamentoID"
                throw new Error(error)
            }
            const precioBase = resuelveConsutaPrecios.rows[0].precio

            const apartamentoUI = resuelveConsutaPrecios.rows[0].apartamentoUI
            const apartamentoIDV = resuelveConsutaPrecios.rows[0].apartamentoIDV
            const moneda = resuelveConsutaPrecios.rows[0].moneda
            // Inyectar variacion de precio
            const detalleApartamento = {
                apartamentoUI: apartamentoUI,
                apartamentoIDV: apartamentoIDV,
                precioBaseNoche: precioBase,

            }

            estructuraFinal.totalesPorApartamento_Objeto[apartamentoIDV] = {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                totalNetoRango: 0,
                totalBrutoRango: 0,
                precioMedioNocheRango: 0
            }
            desglosePreciosBaseApartamentos.push(detalleApartamento)
        }

        

        const comportamientosPorProcesarComoPerfiles = await resolverComportamientosDePrecio(fechaEntrada_ISO, fechaSalida_ISO)
        

        // Borrar la ultima fecha por que se esta calculano noches no dias
        estructuraArregloDiasEnEspera.pop()

        const numeroNoches = estructuraArregloDiasEnEspera.length

        estructuraFinal.metadatos.numeroNoches = numeroNoches
        estructuraFinal.metadatos.totalNeto = 0
        for (const fechaISO of estructuraArregloDiasEnEspera) {
            const fechaObjeto = DateTime.fromISO(fechaISO)
            const dia = fechaObjeto.day;
            
            const mes = fechaObjeto.month;
            const ano = fechaObjeto.year;

            const fechaDiaUI = `${dia}/${mes}/${ano}`
            //SUSTITUIDO POR FECHADIS
            const fechaDia_ISO = `${ano}-${mes}-${dia}`

            const estructuraDia = {
                fechaDiaConNoche: fechaDiaUI,
                precioNetoNoche: null,
                apartamentos: []
            }
            let apartamentoIDVDia
            let precioNetoNoche = new Decimal("0")

            for (const detalleDesglose of desglosePreciosBaseApartamentos) {
                const apartamentoIDV = detalleDesglose.apartamentoIDV
                apartamentoIDVDia = apartamentoIDV
                const precioBase = new Decimal(detalleDesglose.precioBaseNoche);

                const detalleApartamentoPorDia = { ...detalleDesglose };

                if (comportamientosPorProcesarComoPerfiles.length > 0) {
                    let comportamientoEncontrado
                    for (const detalleComportamiento of comportamientosPorProcesarComoPerfiles) {
                        const apartamentoIDVComportamiento = detalleComportamiento.apartamentoIDV
                        const simbolo = detalleComportamiento.simbolo
                        const cantidad = new Decimal(detalleComportamiento.cantidad)

                        const fechaIncioComportamiento_Humano = detalleComportamiento.fechaInicio
                        const fechaFinalComportamiento_Humano = detalleComportamiento.fechaFinal

                        const fechaInicioComortamiento_Array = fechaIncioComportamiento_Humano.split("/")
                        const fehcaInicioComportamiento_ISO = `${fechaInicioComortamiento_Array[2]}-${fechaInicioComortamiento_Array[1]}-${fechaInicioComortamiento_Array[0]}`

                        const fechaFinalComportamiento_Array = fechaFinalComportamiento_Humano.split("/")
                        

                        const fechaFinalComportamiento_ISO = `${fechaFinalComportamiento_Array[2]}-${fechaFinalComportamiento_Array[1]}-${fechaFinalComportamiento_Array[0]}`
                      
                        

                        const controlRangoInterno = verificarFechaEnRango(fehcaInicioComportamiento_ISO, fechaFinalComportamiento_ISO, fechaDia_ISO)

                        if (controlRangoInterno && apartamentoIDV === apartamentoIDVComportamiento) {
                            comportamientoEncontrado = "encontrado"
                            let precioFinalPorNoche
                            if (simbolo === "aumentoPorcentaje") {
                                const calculo = precioBase.times(cantidad.dividedBy(100));
                                precioFinalPorNoche = precioBase.plus(calculo);
                            }
                            if (simbolo === "aumentoCantidad") {
                                const calculo = precioBase.plus(cantidad);
                                precioFinalPorNoche = calculo
                            }
                            if (simbolo === "reducirCantidad") {
                                const calculo = precioBase.minus(cantidad);
                                precioFinalPorNoche = calculo
                            }
                            if (simbolo === "reducirPorcentaje") {
                                const calculo = precioBase.times(cantidad.dividedBy(100));
                                precioFinalPorNoche = precioBase.minus(calculo);
                            }
                            if (simbolo === "precioEstablecido") {
                                precioFinalPorNoche = new Decimal(cantidad)
                            }
                            detalleApartamentoPorDia.comportamientoAplicado = {
                                simboloDelComportamiento: simbolo,
                                cantidad: cantidad.toFixed(2),
                            }


                            detalleApartamentoPorDia.precioNetoNoche = precioFinalPorNoche.isPositive() ? precioFinalPorNoche.toFixed(2) : "0.00";
                            //detalleApartamentoPorDia.tipoSalida = "comportamientoEncontrado"
                            precioNetoNoche = new Decimal(precioNetoNoche).plus(precioFinalPorNoche)
                            break
                        }
                    }
                    if (comportamientoEncontrado !== "encontrado") {
                        detalleApartamentoPorDia.precioNetoNoche = precioBase.toFixed(2)
                        //detalleApartamentoPorDia.tipoSalida = "comportamientoNoEncontrado"
                        precioNetoNoche = new Decimal(precioNetoNoche).plus(precioBase)
                    }

                } else {
                    detalleApartamentoPorDia.precioNetoNoche = precioBase.toFixed(2)
                    //detalleApartamentoPorDia.tipoSalida = "sinComportamiento"
                    precioNetoNoche = new Decimal(precioNetoNoche).plus(precioBase)

                }
                const totalNetoRango = estructuraFinal.totalesPorApartamento_Objeto[apartamentoIDVDia].totalNetoRango ? estructuraFinal.totalesPorApartamento_Objeto[apartamentoIDVDia].totalNetoRango : 0
                const totalNetoRangoFinal = new Decimal(totalNetoRango).plus(detalleApartamentoPorDia.precioNetoNoche).toFixed(2)
                estructuraFinal.totalesPorApartamento_Objeto[apartamentoIDVDia].totalNetoRango = totalNetoRangoFinal

                const impuestosAplicadosPorApartamento = await aplicarImpuestos(totalNetoRangoFinal)
                estructuraFinal.totalesPorApartamento_Objeto[apartamentoIDVDia].totalBrutoRango = new Decimal(totalNetoRangoFinal).plus(impuestosAplicadosPorApartamento.sumaImpuestos).toFixed(2)

                estructuraDia.apartamentos.push(detalleApartamentoPorDia)
                const totalNeto = estructuraFinal.metadatos.totalNeto ? estructuraFinal.metadatos.totalNeto : 0
                estructuraFinal.metadatos.totalNeto = new Decimal(totalNeto).plus(detalleApartamentoPorDia.precioNetoNoche)

                // Precio medie de la noche por apartmento
            }
            estructuraDia.precioNetoNoche = new Decimal(precioNetoNoche).isPositive() ? precioNetoNoche.toFixed(2) : "0.00";
            estructuraFinal.totalesPorNoche_Objeto[fechaDiaUI] = estructuraDia
        }
        const detallePorApartamentoPreFormato = estructuraFinal.totalesPorApartamento_Objeto
        for (const detalleGeneralApartamento of Object.entries(detallePorApartamentoPreFormato)) {
            const preTotalNetoRango = new Decimal(detalleGeneralApartamento[1].totalNetoRango)
            const prePrecioMedioNocheRango = preTotalNetoRango.dividedBy(numeroNoches)
            //            ("detalleGeneralApartamento", detalleGeneralApartamento)

            detalleGeneralApartamento[1].totalNetoRango = preTotalNetoRango.toFixed(2)
            //  
            detalleGeneralApartamento[1].precioMedioNocheRango = prePrecioMedioNocheRango.toFixed(2)
        }

        const totalNetoPreFormato = estructuraFinal.metadatos.totalNeto
        estructuraFinal.metadatos.totalNeto = totalNetoPreFormato

        estructuraFinal.totalesPorNoche = []
        estructuraFinal.totalesPorApartamento = []
        for (const detallesPorNoche of Object.values(estructuraFinal.totalesPorNoche_Objeto)) {
            estructuraFinal.totalesPorNoche.push(detallesPorNoche)
        }
        ( estructuraFinal.totalesPorNoche)

        for (const detallesPorApartamento of Object.values(estructuraFinal.totalesPorApartamento_Objeto)) {
            estructuraFinal.totalesPorApartamento.push(detallesPorApartamento)
        }

        delete estructuraFinal.totalesPorNoche_Objeto
        delete estructuraFinal.totalesPorApartamento_Objeto



        return estructuraFinal
    } catch (error) {
        throw error
    }
}


export {
    precioRangoApartamento
}