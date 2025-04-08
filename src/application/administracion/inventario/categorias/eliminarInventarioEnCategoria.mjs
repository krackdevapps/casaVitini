import { eliminarElementoPorElementoUIDPorCateogriaUID } from "../../../../infraestructure/repository/inventario/categorias/eliminarElementoPorElementoUIDPorCateogriaUID.mjs";
import { obtenerCategoriaPorCategoriaUID } from "../../../../infraestructure/repository/inventario/categorias/obtenerCategoriaPorCategoriaUID.mjs";
import { validarElemento } from "../../../../shared/inventario/validarElemento.mjs";


export const eliminarInventarioEnCategoria = async (entrada) => {
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

        await obtenerCategoriaPorCategoriaUID({
            categoriaUID,
            errorSi: "noExiste"
        })
        const elemento = await eliminarElementoPorElementoUIDPorCateogriaUID({
            categoriaUID,
            elementoUID
        })
        if (!elemento) {
            throw new Error("No se encuentra la categoria en el elemento")
        }

        const ok = {
            ok: "Se ha eliminado la categoria del elemento en el inventario",
            elemento
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}