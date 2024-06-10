import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { totalesBasePorRango } from "./totalesBasePorRango.mjs";
import { aplicarOfertas } from "../../../ofertas/entidades/reserva/aplicarOfertas.mjs";
import { aplicarDescuentosPersonalizados } from "../../../ofertas/entidades/reserva/aplicarDescuentosPersonalizados.mjs";

export const crearDesgloseFinanciero = async (data) => {
    try {
        const estructura = data.estructura
   
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
            fecha_ISO: data?.fechaActual || DateTime.now().setZone(zonaHoraria).toISODate(),
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

        const capaOfertas = data?.capaOfertas
        const capaDescuentosPersonalizados = data?.capaDescuentosPersonalizados

        if (capaOfertas !== "si" && capaOfertas !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaOfertas"
            throw new Error(error)
        }
        if (capaDescuentosPersonalizados !== "si" && capaDescuentosPersonalizados !== "no") {
            const error = "El procesador de precios esta mal configurado, necesita parametro capaDescuentosPersonalizados con un si o un no"
            throw new Error(error)
        }


        await totalesBasePorRango({
            estructura,
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray,
        })


        if (capaOfertas === "si") {

            const zonasArray = validadoresCompartidos.tipos.array({
                array: data?.zonasArray,
                nombreCampo: "El array de zonasArray en el procesador de precios",
                filtro: "soloCadenasIDV",
                sePermitenDuplicados: "no"
            })
            const zonasIDVControl = ["publica", "privada", "global"]

            const contieneSoloValoresPermitidos = zonasArray.every(zonaIDV => zonasIDVControl.includes(zonaIDV));
            if (!contieneSoloValoresPermitidos) {
                const error = "En el array de zonasArray hay identificadores visuales de zona no reconocidos. Los identificadores visuales reconocidos son publica, privada y global"
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
                zonasArray,
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
    } catch (error) {
        throw error
    }
}