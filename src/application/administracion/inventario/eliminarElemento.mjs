import { eliminarElementoPorElementoUID } from "../../../infraestructure/repository/inventario/eliminarElementoPorElementoUID.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";

export const eliminarElemento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        
        const elementoValidado = await validarElemento({
            o: entrada.body,
            filtrosIDV: "elementoUID"
        })
        const elemento = await eliminarElementoPorElementoUID(elementoValidado.elementoUID)

        const ok = {
            ok: "Se ha eliminado el nuevo elemento en el inventario",
            elementoUID: elemento.UID
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}