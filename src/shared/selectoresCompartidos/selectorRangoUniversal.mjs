import { DateTime } from "luxon"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
export const selectorRangoUniversal = async (metadatos) => {
    try {
        const fechaInicio_rango_ISO = metadatos.fechaInicio_rango_ISO
        const fechaFin_rango_ISO = metadatos.fechaFin_rango_ISO
        const fechaInicio_elemento_ISO = metadatos.fechaInicio_elemento_ISO
        const fechaFin_elemento_ISO = metadatos.fechaFin_elemento_ISO

        await validadoresCompartidos.fechas.validarFecha_ISO({
            nombreCampo: "En el selectorRangoUniversal fechaInicio_rango_ISO",
            fecha_ISO: fechaInicio_rango_ISO
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            nombreCampo: "En el selectorRangoUniversal fechaFin_rango_ISO",
            fecha_ISO: fechaFin_rango_ISO
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            nombreCampo: "En el selectorRangoUniversal fechaInicio_elemento_ISO",
            fecha_ISO: fechaInicio_elemento_ISO
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            nombreCampo: "En el selectorRangoUniversal fechaFin_elemento_ISO",
            fecha_ISO: fechaFin_elemento_ISO
        })

        const tipoLimite = metadatos.tipoLimite
        if (tipoLimite !== "incluido" && tipoLimite !== "noIncluido") {
            const mensaje = "El selector de rango universal, necesita un tipo de límite"
            throw new Error(mensaje)
        }
        const inicioRango = DateTime.fromISO(fechaInicio_rango_ISO)
        const finRango = DateTime.fromISO(fechaFin_rango_ISO)
        const inicioElemento = DateTime.fromISO(fechaInicio_elemento_ISO)
        const finElemento = DateTime.fromISO(fechaFin_elemento_ISO)

        if (tipoLimite === "incluido") {

            if (finElemento <= finRango && inicioElemento >= inicioRango) {
                return true;

            }
            if (finElemento >= inicioRango && inicioElemento <= finRango) {
                return true;
            }
        }
        if (tipoLimite === "noIncluido") {

            if (finElemento < finRango && inicioElemento > inicioRango) {
                return true;
            }
            if (finElemento > inicioRango && inicioElemento < finRango) {
                return true;
            }
        }

        if (finElemento < finElemento && inicioElemento > finRango) {
            return true;
        }
        return false;
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
