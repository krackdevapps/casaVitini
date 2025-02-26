import { DateTime } from "luxon"
import { obtenerServicioPorCriterioPublicoPorServicioUIDArray } from "../../infraestructure/repository/servicios/obtenerServicioPorCriterioPublicoPorServicioUIDArray.mjs"
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

        filtroServicios:
        for (const servicioPorValidar of serviciosPorValidar) {

            const servicioUID = servicioPorValidar.servicioUID

            const servicioExistenteAccesible = await obtenerServicioPorCriterioPublicoPorServicioUIDArray({
                zonaIDVArray: [
                    "publica",
                    "global"
                ],
                estadoIDV: "activado",
                serviciosUIDArray: [servicioUID]
            })

            if (servicioExistenteAccesible.length === 0) {
                serviciosPublicos.serviciosNoReconocidos.push(servicioPorValidar)
                continue
            }

            const contendor = servicioExistenteAccesible[0].contenedor
            const tituloPublico = contendor.tituloPublico
            const duracionIDV = contendor.duracionIDV
            const nombre = servicioExistenteAccesible[0].nombbre

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
                    serviciosPublicos.serviciosNoReconocidos.push(servicioPorValidar)
                    continue
                }
            }

            // Valiar grupos de opciones
            const opcionesSeleccionadasPorValidar = servicioPorValidar.opcionesSeleccionadas

            const gruposDeOpcionesDelServicio = servicioExistenteAccesible[0].contenedor.gruposDeOpciones
            for (const [grupoIDV, grupoDeOpciones] of Object.entries(gruposDeOpcionesDelServicio)) {

                // Servicio DB
                const configuracionGrupo = grupoDeOpciones.configuracionGrupo
                const nombreGrupo = grupoDeOpciones.nombreGrupo
                const opcionesGrupo = grupoDeOpciones.opcionesGrupo
                const confSelObligatoria = configuracionGrupo.confSelObligatoria
                const confSelNumero = configuracionGrupo.confSelNumero

                // Servicio a comprorbar
                const grupoPorValidar = opcionesSeleccionadasPorValidar
                // Comporbra si es obligatorio
                if (confSelObligatoria.includes("unaObligatoria")) {
                    if (!grupoPorValidar.hasOwnProperty(grupoIDV)) {
                        serviciosPublicos.serviciosNoReconocidos.push(servicioPorValidar)
                        break filtroServicios
                    }
                    if (grupoPorValidar[grupoIDV].length === 0) {
                        const m = `El servicio ${tituloPublico}, en las opciones de selección ${nombreGrupo}, se requiere seleccionar al menos una opción, gracias.`
                        throw new Error(m)
                    }
                }

                if (confSelNumero.includes("maximoUnaOpcion") && grupoPorValidar[grupoIDV].length > 1) {
                    const m = `El servicio ${tituloPublico}, en las opciones de selección ${nombreGrupo}, solo se permite maximo una opcion seleccionada`
                    throw new Error(m)
                }
                const opcionesIDV = opcionesGrupo.map(o => o.opcionIDV);
                const opcionesIDVNoReconocidos = grupoPorValidar[grupoIDV].filter(o => {
                    const opcionIDV = o.opcionIDV
                    !opcionesIDV.includes(opcionIDV)
                });
                if (opcionesIDVNoReconocidos.length > 0) {
                    serviciosPublicos.serviciosNoReconocidos.push(servicioPorValidar)
                    break filtroServicios
                }
            }
            serviciosPublicos.serviciosSiReconocidos.push(servicioPorValidar)
        }

        return serviciosPublicos
    } catch (error) {
        throw error
    }

}