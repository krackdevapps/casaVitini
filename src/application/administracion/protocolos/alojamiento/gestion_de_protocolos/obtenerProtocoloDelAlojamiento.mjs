import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { obtenerProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/obtenerProtocolosPorApartamentoIDV.mjs";
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { obtenerTareasDelProtocolosPorApartamentoIDV } from "../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/tareas/obtenerTareasDelProtocolosPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const obtenerProtocoloDelAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const data = entrada.body
        const protocolVal = validarInventarioDelProtocolo({
            o: data,
            filtrosIDV: [
                "apartamentoIDV",

            ]
        })
        const alojamiento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV: protocolVal.apartamentoIDV,
            errorSi: "noExiste"
        })
        const inventarioDelProtocolo = await obtenerProtocolosPorApartamentoIDV(protocolVal.apartamentoIDV)
        const tareasDelProtocolo = await obtenerTareasDelProtocolosPorApartamentoIDV(protocolVal.apartamentoIDV)


        const ok = {
            ok: "Elementos del inventario del protocolo del alojamiento",
            alojamiento,
            inventarioDelProtocolo,
            tareasDelProtocolo
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}