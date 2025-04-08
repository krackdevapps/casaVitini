
import { obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV.mjs";
import { validarFechaPosPuesta } from "../../../../../shared/protocolos/validarFechaPosPuesta.mjs";
import { eliminarFechaPorPuestaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/eliminarFechaPorPuestaPorApartamentoIDV.mjs";
import { DateTime } from "luxon";
import { obtenerConfiguracionDeProtocolos } from "../../../../../infraestructure/repository/protocolos/configuracion/obtenerConfiguracionDeProtocolos.mjs";


export const eliminarFechaPosPuesta = async (entrada) => {
    try {


        const oVal = await validarFechaPosPuesta({
            o: entrada.body,
            filtrosIDV: [
                "apartamentoIDV",
            ]
        })

        const apartamentoIDV = oVal.apartamentoIDV
        const ultimaRevision = await obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV(apartamentoIDV)
        if (!ultimaRevision) {
            throw new Error("No se puede postponer la fecha de un alojamiento que no tiene ninguna revision finalizada")
        }

        await eliminarFechaPorPuestaPorApartamentoIDV({
            apartamentoIDV,
        })

        const ok = {
            ok: "Fecha posPuesta eliminada",
            apartamentoIDV
        }
        const fechaActualUTC = DateTime.now().toUTC()
        const configuracionProtocolos = await obtenerConfiguracionDeProtocolos()
        const diasCaducidadRevision = configuracionProtocolos?.diasCaducidadRevision || "0"
        const fechaFinUltimaRevision = ultimaRevision.fechaFin.toISOString()

        const fechaDeCaducidadRevisionUTC = DateTime
            .fromISO(fechaFinUltimaRevision, { setZone: "utc" })
            .plus({ day: diasCaducidadRevision })


        if (fechaDeCaducidadRevisionUTC < fechaActualUTC) {
            ok.vigenciaUltimaRevision = "caducada"
        } else {
            ok.vigenciaUltimaRevision = "vigente"
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}