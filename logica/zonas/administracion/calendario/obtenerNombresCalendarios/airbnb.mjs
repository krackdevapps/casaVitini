import { obtenerNombreApartamentoUI } from "../../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerCalendariosPorPlataformaIDV } from "../../../../repositorio/calendario/obtenerCalendariosPorPlataformaIDV.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const airbnb = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const ok = {
            ok: "Lista con metadtos de los calendarios sincronizados de airbnb",
            calendariosSincronizados: []
        };
        const plataformaOrigen = "airbnb";
        const calenadriosPorPlataforam = await obtenerCalendariosPorPlataformaIDV(plataformaOrigen)
        for (const detallesDelCalendario of calenadriosPorPlataforam) {
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
            detallesDelCalendario.apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
        }
        ok.calendariosSincronizados = [...calenadriosPorPlataforam];
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}