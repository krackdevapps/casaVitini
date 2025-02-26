import { DateTime } from "luxon"
import { obtenerServicioPorCriterioPublico } from "../../../infraestructure/repository/servicios/obtenerServicioPorCriterioPublico.mjs"
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs"
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs"

export const obtenerServiciosPublicos = async () => {
    const servicios = await obtenerServicioPorCriterioPublico({
        zonaIDVArray: [
            "publica",
            "global"
        ],
        estadoIDV: "activado"

    })
    const serviciosPublicos = []
    for (const servicio of servicios) {
        const contendor = servicio.contenedor
        const duracionIDV = contendor.duracionIDV
        if (duracionIDV === "rango") {
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria);
            const fechaActual_ISO = tiempoZH.toISODate();

            const fechaInicio = contendor.fechaInicio
            const fechaFinal = contendor.fechaFinal

            const controlRango = await validadoresCompartidos.fechas.fechaEnRango({
                fechaAComprobrarDentroDelRango: fechaActual_ISO,
                fechaInicioRango_ISO: fechaInicio,
                fechaFinRango_ISO: fechaFinal
            })
            if (!controlRango) {
                continue
            }
        }
        delete servicio.testingVI
        delete servicio.nombre
        delete servicio.zonaIDV
        delete servicio.estadoIDV
        serviciosPublicos.push(servicio)
    }
    const ok = {
        ok: "Lista de servicios publicos",
        servicios: serviciosPublicos
    }
    return ok
}