import { DateTime } from 'luxon';
import Decimal from 'decimal.js';
import { aplicarImpuestos } from './aplicarImpuestos.mjs';
import { selectorRangoUniversal } from '../selectoresCompartidos/selectorRangoUniversal.mjs';
import { resolverComportamientosDePrecio } from './resolverComportamientosDePrecio.mjs';
import { obtenerPerfilPrecioPorApartamentoUID } from '../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs';
import { constructorObjetoEstructuraPrecioDia } from './constructorObjetoEstructuraPrecioDia.mjs';

export const precioRangoApartamento = async (metadatos) => {
    try {
        const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
        const fechaSalida_ISO = metadatos.fechaSalida_ISO
        const apartamentosIDVArreglo = metadatos.apartamentosIDVArreglo
        const estructuraArregloDiasEnEspera = constructorObjetoEstructuraPrecioDia(fechaEntrada_ISO, fechaSalida_ISO);

        const desglosePreciosBaseApartamentos = []
        const estructuraFinal = {}
        estructuraFinal.totalesPorNoche_Objeto = {}
        estructuraFinal.totalesPorApartamento_Objeto = {}
        estructuraFinal.metadatos = {}
        let totalPrecioNeto = 0
        for (const apartamentoIDVGlobal of apartamentosIDVArreglo) {

            const perfilPrecio = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDVGlobal)
            const precioBase = perfilPrecio.precio
            const apartamentoUI = perfilPrecio.apartamentoUI
            const apartamentoIDV = perfilPrecio.apartamentoIDV
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
            const fechaDia_ISO = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
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

                        const controlRangoInterno = await selectorRangoUniversal({
                            fechaInicio_rango_ISO: fehcaInicioComportamiento_ISO,
                            fechaFin_rango_ISO: fechaFinalComportamiento_ISO,
                            fechaInicio_elemento_ISO: fechaDia_ISO,
                            fechaFin_elemento_ISO: fechaDia_ISO,
                            tipoLimite: "incluido"
                        })
                        //Aqui esta el error tipio del selector de rango unidimensional

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
                // Precio medie de la noche por apartamento
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
