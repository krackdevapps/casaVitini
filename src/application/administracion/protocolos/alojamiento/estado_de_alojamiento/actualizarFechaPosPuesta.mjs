
import { obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV.mjs";
import { DateTime } from "luxon";
import { validarFechaPosPuesta } from "../../../../../shared/protocolos/validarFechaPosPuesta.mjs";
import { actualizaFechaPosPuestaPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/actualizaFechaPosPuestaPorApartamentoIDV.mjs";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";


export const actualizarFechaPosPuesta = async (entrada) => {
    try {


        const oVal = await validarFechaPosPuesta({
            o: entrada.body,
            filtrosIDV: [
                "apartamentoIDV",
                "fechaPosPuesta"
            ]
        })

        const apartamentoIDV = oVal.apartamentoIDV
        const ultimaRevision = await obtenerUltimaRevisionPorUltimaFechaPorApartamentoIDV(apartamentoIDV)
        if (!ultimaRevision) {
            throw new Error("No se puede postponer la fecha de un alojamiento que no tiene ninguna revision finalizada")
        }
        const fechaUltimaRevision = ultimaRevision.fechaFin.toISOString()
        const horaFechaUltimaRevision = fechaUltimaRevision.split("T")[1]

        const fechaPosPuesta = oVal.fechaPosPuesta + "T" + horaFechaUltimaRevision

        const fUR = DateTime.fromISO(fechaUltimaRevision);
        const fPP = DateTime.fromISO(fechaPosPuesta);

        if (fUR >= fPP) {
            throw new Error(`La fecha de la última revisión es ${fechaUltimaRevision} y la fecha pospuesta es ${fechaPosPuesta}. No se puede establecer una fecha pospuesta anterior o igual a la fecha de la última revisión`)
        }

        await actualizaFechaPosPuestaPorApartamentoIDV({
            apartamentoIDV,
            fechaPosPuesta
        })
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const fechaPosPuestaLocal = DateTime
            .fromISO(fechaPosPuesta, { setZone: "utc" })
            .setZone(zonaHoraria)
            .toISO();

        const fechaActualUTC = DateTime.now().toUTC()

        const fechaPostPuestaUTC = DateTime
            .fromISO(fechaPosPuesta, { setZone: "utc" })

        const ok = {
            ok: "La fecha pospuesta se ha actualizado",
            apartamentoIDV,
            fechaPosPuestaUTC: fechaPosPuesta,
            fechaPosPuestaLocal
        }


        if (fechaPostPuestaUTC < fechaActualUTC) {
            ok.vigenciaUltimaRevision = "caducada"
        } else {
            ok.vigenciaUltimaRevision = "vigente"
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}