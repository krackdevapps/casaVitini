import { DateTime } from "luxon"
import { validadoresCompartidos } from "../../validadoresCompartidos.mjs"
const selectorRangoUniversal = async (metadatos) => {
    try {
        const fechaInicio_rango_ISO = metadatos.fechaInicio_rango_ISO
        const fechaFin_rango_ISO = metadatos.fechaFin_rango_ISO
        const fechaInicio_elemento_ISO = metadatos.fechaInicio_elemento_ISO
        const fechaFin_elemento_ISO = metadatos.fechaFin_elemento_ISO

        try {
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaInicio_rango_ISO)
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaFin_rango_ISO)
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaInicio_elemento_ISO)
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaFin_elemento_ISO)
        } catch (errorCapturado) {
            const mensaje = "En validadores del selectorRangoUniversal hay una fecha que no cumple el formato iso."
            throw new Error(mensaje)
        }

        const tipoLimite = metadatos.tipoLimite
        if (tipoLimite !== "incluido" && tipoLimite !== "noIncluido") {
            const mensaje = "El selector de rango universal, necesita un tipo de limite"
            throw new Error(mensaje)
        }
        const inicioRango = DateTime.fromISO(fechaInicio_rango_ISO)
        const finRango = DateTime.fromISO(fechaFin_rango_ISO)
        const inicioElemento = DateTime.fromISO(fechaInicio_elemento_ISO)
        const finElemento = DateTime.fromISO(fechaFin_elemento_ISO)

        if (tipoLimite === "incluido") {
            // Caso 2: Evento parcialmente dentro del rango
            if (finElemento <= finRango && inicioElemento >= inicioRango) {
                return true;

            }
            if (finElemento >= inicioRango && inicioElemento <= finRango) {
                return true;
            }
        }
        if (tipoLimite === "noIncluido") {
            // Caso 2: Evento parcialmente dentro del rango
            if (finElemento < finRango && inicioElemento > inicioRango) {
                return true;
            }
            if (finElemento > inicioRango && inicioElemento < finRango) {
                return true;
            }
        }
        // Caso 3: Evento atraviesa el rango
        if (finElemento < finElemento && inicioElemento > finRango) {
            return true;
        }
        return false;
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
export {
    selectorRangoUniversal
}