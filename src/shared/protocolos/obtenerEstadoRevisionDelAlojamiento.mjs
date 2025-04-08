import { DateTime } from "luxon"
import { obtenerConfiguracionDeProtocolos } from "../../infraestructure/repository/protocolos/configuracion/obtenerConfiguracionDeProtocolos.mjs"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import { obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV } from "../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV.mjs"
import { obtenerFechaPostPuestaPorApartamentoIDV } from "../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerFechaPostPuestaPorApartamentoIDV.mjs"
import { reservasPorRangoSoloFechaEntradaPorApartamentosArray } from "../../infraestructure/repository/reservas/selectoresDeReservas/reservasPorRangoSoloFechaEntradaPorApartamentosArray.mjs"

export const obtenerEstadoRevisionDelAlojamiento = async (data) => {


    try {
        const apartamentoIDV = data.apartamentoIDV
        const configuracionProtocolos = await obtenerConfiguracionDeProtocolos()

        const diasCaducidadRevision = configuracionProtocolos?.diasCaducidadRevision || "0"
        const diasAntelacionPorReserva = configuracionProtocolos?.diasAntelacionPorReserva || "0"
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const fechaActualUTC = DateTime.now().toUTC()
        const fechaActualLocal = DateTime.now().setZone(zonaHoraria).toISO()

        const estadoPreparacion = {
            apartamentoIDV: apartamentoIDV,
            vigenciaUltimaRevision: null,
            fechaPostPuestaLocal: null,
            fechaUltimaRevisionLocal: null,
            fechaDeCaducidadRevisionLocal: null,
            fechaAntelacionLocal: null,
            reservasEntrantes: null,
            ultimaRevision: null,
            revisionResumen : null
        };

        const ultimaRevision = await obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV(apartamentoIDV)

        if (ultimaRevision) {
            const fechaFinUltimaRevision = ultimaRevision.fechaFin
            const fechaUltimaRevisionLocal = DateTime
                .fromISO(fechaFinUltimaRevision.toISOString(), { setZone: "utc" })
                .setZone(zonaHoraria)
                .toISO();

            const fechaDeCaducidadRevisionLocal = DateTime
                .fromISO(fechaFinUltimaRevision.toISOString(), { setZone: "utc" })
                .setZone(zonaHoraria)
                .plus({ day: diasCaducidadRevision })
                .toISO();

            estadoPreparacion.fechaUltimaRevisionLocal = fechaUltimaRevisionLocal
            estadoPreparacion.fechaDeCaducidadRevisionLocal = fechaDeCaducidadRevisionLocal
            estadoPreparacion.ultimaRevision = ultimaRevision

            const fechaDeCaducidadRevisionUTC = DateTime
                .fromISO(fechaFinUltimaRevision.toISOString(), { setZone: "utc" })
                .plus({ day: diasCaducidadRevision })

            // Si la fecha de la ultim revision mas los dias de caudiad es inferior a la fecha actual

            const reposicionInventario = ultimaRevision.reposicionInventario
            const tareas = ultimaRevision.tareas
            const reposicionFinal = reposicionInventario.find(r => r.color === "rojo")
            const tareasFinal = tareas.find(r => r.color === "rojo")

            if (reposicionFinal) {
                estadoPreparacion.revisionResumen = "Este alojamiento no tiene el inventario repuesto"
            }
            if (tareasFinal) {
   
                estadoPreparacion.revisionResumen = "Este alojamiento no ha pasado las tareas de limpieza"
            }

            if (!tareasFinal && !reposicionFinal) {
                estadoPreparacion.revisionResumen = "Revisión realizada con éxito"
            }

            const peticionFechaPostPuesta = await obtenerFechaPostPuestaPorApartamentoIDV(apartamentoIDV)
            if (peticionFechaPostPuesta) {
                const fechaPostPuestaUTC_cadena = peticionFechaPostPuesta.fechaPostPuesta.toISOString()

                const fechaPostPuestaUTC = DateTime
                    .fromISO(fechaPostPuestaUTC_cadena, { setZone: "utc" })

                const fechaPostPuestaLocal = DateTime
                    .fromISO(fechaPostPuestaUTC_cadena, { setZone: "utc" })
                    .setZone(zonaHoraria)
                    .toISO();

                estadoPreparacion.fechaPostPuestaLocal = fechaPostPuestaLocal

                if (fechaPostPuestaUTC < fechaActualUTC) {
                    estadoPreparacion.vigenciaUltimaRevision = "caducada"
                } else {
                    estadoPreparacion.vigenciaUltimaRevision = "vigente"
                }

            } else {
                if (fechaDeCaducidadRevisionUTC < fechaActualUTC) {
                    estadoPreparacion.vigenciaUltimaRevision = "caducada"
                } else {
                    estadoPreparacion.vigenciaUltimaRevision = "vigente"
                }
            }
        }
        const fechaAntelacionLocal = DateTime.now().setZone(zonaHoraria).plus({ day: diasAntelacionPorReserva }).toISO()
        estadoPreparacion.fechaActualUTC = fechaActualUTC.toISO()
        estadoPreparacion.fechaActualLocal = fechaActualLocal
        estadoPreparacion.fechaAntelacionLocal = fechaAntelacionLocal

        const reserervasEntrantes = await reservasPorRangoSoloFechaEntradaPorApartamentosArray({
            fechaInicioRango_ISO: fechaActualLocal,
            fechaFinRango_ISO: fechaAntelacionLocal,
            apartamentosIDV_array: [apartamentoIDV]
        })
        estadoPreparacion.reservasEntrantes = reserervasEntrantes

        return estadoPreparacion

    } catch (error) {
        throw error
    }
}