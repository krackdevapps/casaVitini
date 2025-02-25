import { DateTime } from 'luxon';
import Decimal from 'decimal.js';
import { aplicarImpuestos } from './aplicarImpuestos.mjs';
import { selectorRangoUniversal } from '../selectoresCompartidos/selectorRangoUniversal.mjs';
import { resolverComportamientosDePrecio } from './resolverComportamientosDePrecio.mjs';
import { obtenerPerfilPrecioPorApartamentoIDV } from '../../infraestructure/repository/precios/obtenerPerfilPrecioPorApartamentoIDV.mjs';


const constructorObjetoEstructuraPrecioDia = (fechaEntrada, fechaSalida) => {
    const arregloFechas = [];
    let fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada); // Convertir la fecha de entrada a un objeto DateTime
    const fechaSalida_Objeto = DateTime.fromISO(fechaSalida)
    while (fechaEntrada_Objeto <= fechaSalida_Objeto) {
        arregloFechas.push(fechaEntrada_Objeto.toISODate());
        fechaEntrada_Objeto = fechaEntrada_Objeto.plus({ days: 1 }); // Avanzar al siguiente día
    }
    return arregloFechas;
}
export const precioRangoApartamento = async (metadatos) => {

    try {

        const fechaEntrada = metadatos.fechaEntrada
        const fechaSalida = metadatos.fechaSalida

        const apartamentosIDVArreglo = metadatos.apartamentosIDVArreglo
        const estructuraArregloDiasEnEspera = constructorObjetoEstructuraPrecioDia(fechaEntrada, fechaSalida);

        const desglosePreciosBaseApartamentos = []
        const estructuraFinal = {}
        estructuraFinal.totalesPorNoche_Objeto = {}
        estructuraFinal.totalesPorApartamento_Objeto = {}
        estructuraFinal.metadatos = {}
        let totalPrecioNeto = 0

        for (const apartamentoIDVGlobal of apartamentosIDVArreglo) {

            const perfilPrecio = await obtenerPerfilPrecioPorApartamentoIDV(apartamentoIDVGlobal)
            const precioBase = perfilPrecio.precio
            const apartamentoUI = perfilPrecio.apartamentoUI
            const apartamentoIDV = perfilPrecio.apartamentoIDV



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

        const comportamientosPorProcesarComoPerfiles = await resolverComportamientosDePrecio(fechaEntrada, fechaSalida)


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

            const fechaDia_ISO = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
            const estructuraDia = {
                fechaDiaConNoche: fechaDiaUI,
                precioNetoNoche: null,
                apartamentos: []
            }
            let apartamentoIDVDia
            let precioNetoNocheAcumulador = new Decimal("0")
            for (const detalleDesglose of desglosePreciosBaseApartamentos) {
                const apartamentoIDV = detalleDesglose.apartamentoIDV
                apartamentoIDVDia = apartamentoIDV
                const precioBase = new Decimal(detalleDesglose.precioBaseNoche);
                const detalleApartamentoPorDia = { ...detalleDesglose };
                if (comportamientosPorProcesarComoPerfiles.length > 0) {
                    let comportamientoEncontrado
                    for (const detalleComportamiento of comportamientosPorProcesarComoPerfiles) {
                        const apartamentoIDVComportamiento = detalleComportamiento.apartamentoIDV
                        const simbolo = detalleComportamiento.simboloIDV
                        const cantidad = new Decimal(detalleComportamiento.cantidad)
                        const fehcaInicioComportamiento_ISO = detalleComportamiento.fechaInicio
                        const fechaFinalComportamiento_ISO = detalleComportamiento.fechaFinal


                        const controlRangoInterno = await selectorRangoUniversal({
                            fechaInicio_rango_ISO: fehcaInicioComportamiento_ISO,
                            fechaFin_rango_ISO: fechaFinalComportamiento_ISO,
                            fechaInicio_elemento_ISO: fechaDia_ISO,
                            fechaFin_elemento_ISO: fechaDia_ISO,
                            tipoLimite: "incluido"
                        })


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

                            precioNetoNoche = new Decimal(precioNetoNoche).plus(precioFinalPorNoche)
                            break
                        }
                    }
                    if (comportamientoEncontrado !== "encontrado") {
                        detalleApartamentoPorDia.precioNetoNoche = precioBase.toFixed(2)

                        precioNetoNoche = new Decimal(precioNetoNoche).plus(precioBase)
                    }
                } else {
                    detalleApartamentoPorDia.precioNetoNoche = precioBase.toFixed(2)

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

            }
            estructuraDia.precioNetoNoche = new Decimal(precioNetoNoche).isPositive() ? precioNetoNoche.toFixed(2) : "0.00";
            estructuraFinal.totalesPorNoche_Objeto[fechaDiaUI] = estructuraDia
        }
        const detallePorApartamentoPreFormato = estructuraFinal.totalesPorApartamento_Objeto
        for (const detalleGeneralApartamento of Object.entries(detallePorApartamentoPreFormato)) {
            const preTotalNetoRango = new Decimal(detalleGeneralApartamento[1].totalNetoRango)
            const prePrecioMedioNocheRango = preTotalNetoRango.dividedBy(numeroNoches)
            detalleGeneralApartamento[1].totalNetoRango = preTotalNetoRango.toFixed(2)
            detalleGeneralApartamento[1].precioMedioNocheRango = prePrecioMedioNocheRango.toFixed(2)
        }
        const totalNetoPreFormato = estructuraFinal.metadatos.totalNeto
        estructuraFinal.metadatos.totalNeto = totalNetoPreFormato
        estructuraFinal.totalesPorNoche = []
        estructuraFinal.totalesPorApartamento = []
        for (const detallesPorNoche of Object.values(estructuraFinal.totalesPorNoche_Objeto)) {
            estructuraFinal.totalesPorNoche.push(detallesPorNoche)
        }
        (estructuraFinal.totalesPorNoche)
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
