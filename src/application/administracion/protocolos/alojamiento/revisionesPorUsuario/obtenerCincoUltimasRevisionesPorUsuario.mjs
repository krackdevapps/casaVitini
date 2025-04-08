import { DateTime } from "luxon";
import { obtenerUltimasRevisionesPorUsuario } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerUltimasRevisionesPorUsuario.mjs";
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";
import { obtenerConfiguracionDeProtocolos } from "../../../../../infraestructure/repository/protocolos/configuracion/obtenerConfiguracionDeProtocolos.mjs";

export const obtenerCincoUltimasRevisionesPorUsuario = async (entrada) => {
    try {


        const oVal = validarInventarioDelProtocolo({
            o: entrada.body,
            filtrosIDV: [
                "usuario",

            ]
        })
        const usuario = oVal.usuario
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const configuracionProtocolos = await obtenerConfiguracionDeProtocolos()
        const diasCaducidadRevision = configuracionProtocolos?.diasCaducidadRevision || "0"

        const ultimasRevisiones = await obtenerUltimasRevisionesPorUsuario(usuario)
        for (const uR of ultimasRevisiones) {

            const fechaFinUltimaRevision = uR?.fechaFin
            if (fechaFinUltimaRevision) {
                uR.fechaFinLocal = DateTime
                    .fromISO(fechaFinUltimaRevision.toISOString(), { setZone: "utc" })
                    .setZone(zonaHoraria)
                    .toISO();
            }

            const reposicionInventario = uR?.reposicionInventario || []

            const tareas = uR?.tareas || []
            const reposicionFinal = reposicionInventario.find(r => r.color === "rojo")
            const tareasFinal = tareas.find(r => r.color === "rojo")

            if (reposicionFinal) {
                uR.revisionResumen = "Este alojamiento no tiene el inventario repuesto"
            }
            if (tareasFinal) {
                uR.revisionResumen = "Este alojamiento no ha pasado las tareas de limpieza"
            }

            if (!tareasFinal && !reposicionFinal) {
                uR.revisionResumen = "Revisión realizada con éxito"
            }

        }
        const ok = {
            ok: "Ultimas revisiones del usuariop",
            ultimasRevisiones
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}