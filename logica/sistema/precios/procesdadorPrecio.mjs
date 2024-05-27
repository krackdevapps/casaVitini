import { DateTime } from "luxon"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { totalesBasePorRango } from "./totalesBasePorRango.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { aplicarOfertas } from "../ofertas/aplicarOfertas.mjs"

export const procesadorPrecio = async (data) => {
    try {
        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaEntrada,
            nombreCampo: "LA fecha de entrada del procesador de precios"
        })

        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaSalida,
            nombreCampo: "LA fecha de salida del procesador de precios"
        })

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: data.fechaEntrada,
            fechaSalida_ISO: data.fechaSalida,
            tipoVector: "diferente"
        })

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActual = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: data.fechaActual || DateTime.now().setZone(zonaHoraria).toISODate(),
            nombreCampo: "LA fecha de salida del procesador de precios"
        })

        const apartamentosArray = validadoresCompartidos.tipos.array({
            array: data.apartamentosArray,
            nombreCampo: "El array de apartamentos en el procesador de precios",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })

        for (const apartamentoIDV of apartamentosArray) {
            await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        }
        console.log("antes")
        const totalesBase = await totalesBasePorRango({
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            apartamentosArray
        })
        console.log("despues")

        const ofertasAplicadas = await aplicarOfertas({
            totalesBase,
            fechaActual,
            fechaEntrada,
            fechaSalida,
            apartamentosArray
        })

        // Aplicar ofertas
        // Aplicar impuestos
        // Generar totales


        return totalesBase

    } catch (error) {
        throw error
    }


}