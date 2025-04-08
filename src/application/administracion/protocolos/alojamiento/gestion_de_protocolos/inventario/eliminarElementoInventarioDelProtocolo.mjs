import { campoDeTransaccion } from "../../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { actualizarOrdenDePosicionesInventario } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/actualizarOrdenDePosicionesInventario.mjs"
import { eliminarElementoDelProtocoloPorUID } from "../../../../../../infraestructure/repository/protocolos/alojamiento/gestion_de_protocolos/inventario/eliminarElementoDelProtocoloPorUID.mjs"
import { validarInventarioDelProtocolo } from "../../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs"

export const eliminarElementoInventarioDelProtocolo = async (entrada) => {
    try {
        const protocolVal = validarInventarioDelProtocolo({
            o: entrada.body,
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
            apartamentoIDV: apartamentoIDV
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