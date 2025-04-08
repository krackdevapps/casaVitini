import { obtenerCategoriaPorCategoriaUID } from "../../../../infraestructure/repository/inventario/categorias/obtenerCategoriaPorCategoriaUID.mjs";
import { validarElemento } from "../../../../shared/inventario/validarElemento.mjs";

export const detallesCategoria = async (entrada) => {
    try {
        const oVal = validarElemento({
            o: entrada.body,
            filtrosIDV: [
                "categoriaUID",
            ]
        })
        const categoriaUID = oVal.categoriaUID
        const categoria = await obtenerCategoriaPorCategoriaUID({
            categoriaUID,
            errorSi: "noExiste"
        })

        const ok = {
            ok: "Detalles de la categoria en el inventario",
            categoria
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}