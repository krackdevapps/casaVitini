
import { insertarNuevoInventarioEnCategoria } from "../../../../infraestructure/repository/inventario/categorias/insertarNuevoInventarioEnCategoria.mjs";
import { obtenerCategoriaPorCategoriaUID } from "../../../../infraestructure/repository/inventario/categorias/obtenerCategoriaPorCategoriaUID.mjs";
import { obtenerIventarioEnCategoriaPorElementoUIDPorCategoriaUID } from "../../../../infraestructure/repository/inventario/categorias/obtenerIventarioEnCategoriaPorElementoUIDPorCategoriaUID.mjs";
import { validarElemento } from "../../../../shared/inventario/validarElemento.mjs";

export const insertarInventarioEnCategoria = async (entrada) => {
    try {
        const oVal = validarElemento({
            o: entrada.body,
            filtrosIDV: [
                "categoriaUID",
                "elementoUID",
            ]
        })

        const categoriaUID = oVal.categoriaUID
        const elementoUID = oVal.elementoUID

       const categoria = await obtenerCategoriaPorCategoriaUID({
            categoriaUID,
            errorSi: "noExiste"
        })

        await obtenerIventarioEnCategoriaPorElementoUIDPorCategoriaUID({
            elementoUID,
            categoriaUID,
            errorSi: "existe"
        })
        // Comprobar que el elemento no esta en la cartegoria
        const elemento = await insertarNuevoInventarioEnCategoria({
            categoriaUID: categoriaUID,
            elementoUID: elementoUID,

        })
        const ok = {
            ok: "Se ha insertado el elemento del inventario en el protocolo de alojamiento",
            elementoUID_enInventario: elemento.uid,
            categoria
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}