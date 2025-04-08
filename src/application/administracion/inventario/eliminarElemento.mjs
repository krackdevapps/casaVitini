import { eliminarElementoPorElementoUID } from "../../../infraestructure/repository/inventario/eliminarElementoPorElementoUID.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";

export const eliminarElemento = async (entrada) => {
    try {
        const elementoValidado = await validarElemento({
            o: entrada.body,
            filtrosIDV: ["elementoUID"]
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