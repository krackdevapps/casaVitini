import { DateTime } from "luxon";
import { obtenerConfiguracionPorApartamentoIDV } from "../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { finalizaEstadoRevision } from "../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/finalizaEstadoRevision.mjs";

export const finalizaRevision = async (data) => {

    const revisionUID = data.revisionUID
    const tiempoZH = DateTime.now();
    const fechaActual = tiempoZH.toISO();

    const revisionCompletada = await finalizaEstadoRevision({
        uid: revisionUID,
        fechaFin: fechaActual,
        estadoRevision: "finalizada",
    })

    const apartamentoIDV = revisionCompletada.apartamentoIDV
    const alojamiento = await obtenerConfiguracionPorApartamentoIDV({
        apartamentoIDV,
        errorSi: "noExiste"
    })
    revisionCompletada.apartamentoUI = alojamiento.apartamentoUI
    return revisionCompletada

}