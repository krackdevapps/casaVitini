import { VitiniIDX } from "../../../../../../shared/VitiniIDX/control.mjs";
import { actualizarCantidadEnElemento } from "../../../../../../infraestructure/repository/protocolos/alojamiento/inventario/actualizarCantidadEnElemento.mjs";
import { validarInventarioDelProtocolo } from "../../../../../../shared/protocolos/validarInventarioDelProtocolo.mjs";
export const actualizarCantidadElementoInventario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const nuevoElemento = entrada.body
        const protocolVal = validarInventarioDelProtocolo({
            o: nuevoElemento,
            filtrosIDV: [
                "uid",
                "cantidad_enAlojamiento"
            ]
        })

        const elemento = await actualizarCantidadEnElemento({
            uid: protocolVal.uid,
            cantidad_enAlojamiento: protocolVal.cantidad_enAlojamiento
        })

        const ok = {
            ok: "Se ha actualizado la cantidad del elemento del inventario en el protocolo de alojamiento",
            elemento
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}