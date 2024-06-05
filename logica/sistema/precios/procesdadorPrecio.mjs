import { DateTime } from "luxon"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { totalesBasePorRango } from "./totalesBasePorRango.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { aplicarOfertas } from "../ofertas/aplicarOfertas.mjs"
import { aplicarImpuestos } from "./aplicarImpuestos.mjs"
import { aplicarDescuentosPersonalizados } from "../ofertas/aplicarDescuentosPersonalizados.mjs"
import { estructuraDesgloseFinanciero } from "./estructuraDesgloseFinanciero.mjs"

export const procesadorPrecio = async (data) => {
    try {
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "La fecha de entrada del procesador de precios"
        })

        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "La fecha de salida del procesador de precios"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: data.fechaEntrada,
            fechaSalida_ISO: data.fechaSalida,
            tipoVector: "diferente"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActual = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaActual || DateTime.now().setZone(zonaHoraria).toISODate(),
            nombreCampo: "La fecha de actual del procesador de precios"
        })

        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el procesador de precios",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })

        for (const apartamentoIDV of apartamentosArray) {
            await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        }
        const capaImpuestos = data?.capaImpuestos
        const capaOfertas = data?.capaOfertas
        const capaDescuentosPersonalizados = data?.capaDescuentosPersonalizados
        if (capaImpuestos !== "si" && capaImpuestos !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaImpuestos"
            throw new Error(error)
        }
        if (capaOfertas !== "si" && capaOfertas !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaOfertas"
            throw new Error(error)
        }
        if (capaDescuentosPersonalizados !== "si" && capaDescuentosPersonalizados !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaDescuentosPersonalizados"
            throw new Error(error)
        }

        const estructura = estructuraDesgloseFinanciero()

        await totalesBasePorRango({
            estructura,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray
        })
        if (capaOfertas === "si") {

            const zonasDeLaOferta = validadoresCompartidos.tipos.array({
                array: data?.zonasDeLaOferta,
                nombreCampo: "El array de zonasDeLaoferta en el procesador de precios",
                filtro: "soloCadenasIDV",
                sePermitenDuplicados: "no"
            })
            const zonasIDVControl = ["publica", "privada", "global"]

            const contieneSoloValoresPermitidos = zonasDeLaOferta.every(zonaIDV => zonasIDVControl.includes(zonaIDV));
            if (!contieneSoloValoresPermitidos) {
                const error = "En el array de zonasDeLaOferta hay identificadores visuales de zona no reconocidos. Los identificadores visuales reconocidos son publica, privada y global"
                throw new Error(error)
            }
            const descuentosParaRechazar = validadoresCompartidos.tipos.array({
                array: data?.descuentosParaRechazar || [],
                nombreCampo: "descuentosParaRechazar en el procesador de precios",
                filtro: "soloCadenasIDV",
                sePermitenDuplicados: "si",
                sePermiteArrayVacio: "si"
            })

            await aplicarOfertas({
                estructura,
                fechaActual,
                fechaEntrada,
                fechaSalida,
                apartamentosArray,
                zonasDeLaOferta,
                descuentosParaRechazar
            })
        }

        if (capaDescuentosPersonalizados === "si") {
            const descuentosArray = validadoresCompartidos.tipos.array({
                array: data.descuentosArray,
                nombreCampo: "El array de descuentosArray en el procesador de precios",
                filtro: "cadenaConNumerosEnteros",
                sePermitenDuplicados: "si"
            })

            await aplicarDescuentosPersonalizados({
                estructura,
                descuentosArray,
                fechaEntradaReserva_ISO: fechaEntrada,
                fechaSalidaReserva_ISO: fechaSalida
            })
        }
        if (capaImpuestos === "si") {
            await aplicarImpuestos(estructura)
        }
        const ok = {
            desgloseFinanciero: estructura
        }
        return ok
    } catch (error) {
        throw error
    }
}