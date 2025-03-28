import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { eliminarElementoDelProtocoloPorUID } from "../../../../../infraestructure/repository/protocolos/alojamiento/inventario/eliminarElementoDelProtocoloPorUID.mjs";
import { validarInventarioDelProtocolo } from "../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
import { actualizarOrdenDePosicionesInventario } from "../../../../../infraestructure/repository/protocolos/alojamiento/inventario/actualizarOrdenDePosicionesInventario.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const eliminarElementoInventarioDelProtocolo = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const data = entrada.body


        const protocolVal = validarInventarioDelProtocolo({
            o: data,
            filtrosIDV: [
                "uid",
            ]
        })
        await campoDeTransaccion("iniciar")

        const elementoEliminado = await eliminarElementoDelProtocoloPorUID(protocolVal.uid)
        const posicionEliminada = elementoEliminado.posicion
        const apartamentoIDV = elementoEliminado.apartamentoIDV
        await actualizarOrdenDePosicionesInventario({
            posicion: posicionEliminada,
            apartamentoIDV : apartamentoIDV
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha eliminado el elemento del inventario del alojamiento",
            elementoEliminado
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorCapturado
    }
}