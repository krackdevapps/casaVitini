import { actualizarNombreCategoriaPorCategoriaUID } from "../../../../infraestructure/repository/inventario/categorias/actualizarNombreCategoriaPorCategoriaUID.mjs";
import { validarElemento } from "../../../../shared/inventario/validarElemento.mjs";

export const actualizarNombreCategoria = async (entrada) => {
    try {


        const oVal = validarElemento({
            o: entrada.body,
            filtrosIDV: [
                "categoriaUID",
                "categoriaUI",
                "descripcion"
            ]
        })
        const categoriaUI = oVal.categoriaUI
        const categoriaUID = oVal.categoriaUID
        const descripcion = oVal.descripcion

        const categoria = await actualizarNombreCategoriaPorCategoriaUID({
            categoriaUI,
            categoriaUID,
            descripcion
        })

        const ok = {
            ok: "Se la categoria en el inventario",
            categoriaUID: categoria.categoriaUID
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}