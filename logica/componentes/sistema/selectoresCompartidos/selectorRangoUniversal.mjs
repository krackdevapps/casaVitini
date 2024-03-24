import { DateTime } from "luxon"
const selectorRangoUniversal = (metadatos) => {
    try {
        const fechaInicio_rango_ISO = metadatos.fechaInicio_rango_ISO
        const fechaFin_rango_ISO = metadatos.fechaFin_rango_ISO
        const fechaInicio_elemento_ISO = metadatos.fechaInicio_elemento_ISO
        const fechaFin_elemento_ISO = metadatos.fechaFin_elemento_ISO
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
                console.log("1")
                return true;
                
            }
            if (finElemento >= inicioRango && inicioElemento <= finRango) {
                console.log("01")
                return true;
            }
        }
        if (tipoLimite === "noIncluido") {
            // Caso 2: Evento parcialmente dentro del rango
            if (finElemento < finRango && inicioElemento > inicioRango) {
                console.log("1")
                return true;
            }
            if (finElemento > inicioRango && inicioElemento < finRango) {
                console.log("02")
                return true;
            }
        }
        // Caso 3: Evento atraviesa el rango
        if (finElemento < finElemento && inicioElemento > finRango) {
            
            console.log("3")
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