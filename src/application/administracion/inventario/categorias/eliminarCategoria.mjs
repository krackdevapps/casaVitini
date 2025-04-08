import { eliminarCategoriaPorCategoriaUID } from "../../../../infraestructure/repository/inventario/categorias/eliminarCategoriaPorCategoriaUID.mjs";
import { validarElemento } from "../../../../shared/inventario/validarElemento.mjs";

export const eliminarCategoria = async (entrada ) => {
    try {
        const elementoValidado = await validarElemento({
            o: entrada.body,
            filtrosIDV: ["categoriaUID"]
        })
        const categoria = await eliminarCategoriaPorCategoriaUID(elementoValidado.categoriaUID)
        const ok = {
            ok: "Se ha eliminado la categoria del inventario",
            categoria: categoria.categoriaUID
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}