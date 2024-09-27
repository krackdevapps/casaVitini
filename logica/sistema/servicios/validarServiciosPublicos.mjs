import { DateTime } from "luxon"
import { obtenerServicioPorCriterioPublicoPorServicioUIDArray } from "../../repositorio/servicios/obtenerServicioPorCriterioPublicoPorServicioUIDArray.mjs"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const validarServiciosPubicos = async (data) => {
    try {
        const serviciosPorValidar = data || []
        const serviciosPublicos = {
            serviciosSiReconocidos: [],
            serviciosNoReconocidos: []
        }
        if (serviciosPorValidar.length === 0) {
            return serviciosPublicos
        }

        const serviciosUIDArray = serviciosPorValidar.map((contenedor) => {
            return contenedor.servicioUID
        })

        const servicios = await obtenerServicioPorCriterioPublicoPorServicioUIDArray({
            zonaIDVArray: [
                "publica",
                "global"
            ],
            estadoIDV: "activado",
            serviciosUIDArray
        })

        for (const servicio of servicios) {
            const contendor = servicio.contenedor
            const tituloPublico = contendor.tituloPublico
            const duracionIDV = contendor.duracionIDV
            const servicioUID = servicio.servicioUID

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
            serviciosPublicos.serviciosSiReconocidos.push({
                servicioUID,
                servicioUI: tituloPublico
            })
        }


        const serviciosNoReconocidos = serviciosPublicos.serviciosNoReconocidos
        const serviciodUIDValidos = serviciosPublicos.serviciosSiReconocidos.map((contenedor) => {
            return contenedor.servicioUID
        })

        serviciosPorValidar.forEach((contenedor) => {
            const servicioUID = contenedor.servicioUID
            if (!serviciodUIDValidos.includes(servicioUID)) {
                serviciosNoReconocidos.push(contenedor)
            }
       })

        return serviciosPublicos
    } catch (error) {
        throw error
    }

}