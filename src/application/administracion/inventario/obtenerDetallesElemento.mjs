
import { obtenerCategoriasDelElementoPorElementoUID } from "../../../infraestructure/repository/inventario/categorias/obtenerCategoriasDelElementoPorElementoUID.mjs";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";

export const obtenerDetallesElemento = async (entrada) => {
    try {



        const elementoValidado = validarElemento({
            o: entrada.body,
            filtrosIDV: [
                "elementoUID"
            ]
        })

        const elemento = await obtenerElementoPorElementoUID({
            elementoUID: elementoValidado.elementoUID,
            errorSi: "noExiste"
        })
        const categoriasDelEmento = await obtenerCategoriasDelElementoPorElementoUID({
            elementoUID: elementoValidado.elementoUID,
            errorSi: "desactivado"
        })
        // obtener categorias del elemento
        const ok = {
            ok: elemento,
            categoriasDelEmento
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}