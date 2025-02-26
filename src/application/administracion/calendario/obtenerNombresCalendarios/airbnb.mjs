import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerCalendariosPorPlataformaIDV } from "../../../../infraestructure/repository/calendario/obtenerCalendariosPorPlataformaIDV.mjs";
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";

export const airbnb = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const ok = {
            ok: "Lista con datos de los calendarios sincronizados de airbnb",
            calendariosSincronizados: []
        };
        const plataformaOrigen = "airbnb";
        const calenadriosPorPlataforam = await obtenerCalendariosPorPlataformaIDV(plataformaOrigen)
        for (const detallesDelCalendario of calenadriosPorPlataforam) {
            const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
            detallesDelCalendario.apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })).apartamentoUI
        }
        ok.calendariosSincronizados = [...calenadriosPorPlataforam];
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}