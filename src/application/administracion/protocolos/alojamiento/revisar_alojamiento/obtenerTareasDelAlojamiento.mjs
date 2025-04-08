
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { obtenerTareasDelProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareasDelProtocolosPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { filtroTareasPorDia } from "../../../../../shared/protocolos/filtroTareasPorDia.mjs";
import { obtenerRevisionEnCursoPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/revision_alojamiento/obtenerRevisionEnCursoPorApartamentoIDV.mjs";

export const obtenerTareasDelAlojamiento = async (entrada) => {
    try {
        const data = entrada.body
        const protocolVal = validarInventarioDelProtocolo({
            o: data,
            filtrosIDV: [
                "apartamentoIDV",
            ]
        })

        const apartamentoIDV = protocolVal.apartamentoIDV
        const alojamiento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: apartamentoIDV,
            errorSi: "noExiste"
        })

        const tareasDelProtocolo = await obtenerTareasDelProtocolosPorApartamentoIDV(apartamentoIDV)
        const tareasDelDia = await filtroTareasPorDia({
            tareas: tareasDelProtocolo,
            apartamentoIDV
        })

        const arrayOrdenado = tareasDelDia.sort((a, b) => a.posicion - b.posicion);

        const revisionEnCurso = await obtenerRevisionEnCursoPorApartamentoIDV(apartamentoIDV)

        const ok = {
            ok: "Tareas del alojamiento filtradas por dias",
            alojamiento,
            tareasDelDia,
            tipoDiaActual: arrayOrdenado,
            arrayOrdenado,
            revisionEnCurso
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}