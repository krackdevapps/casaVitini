import { insertarNuevaCategoria } from "../../../../infraestructure/repository/inventario/categorias/insertarNuevaCategoria.mjs";
import { validarElemento } from "../../../../shared/inventario/validarElemento.mjs";

export const crearCategoria = async (entrada) => {
    try {
        const nuevoElemento = entrada.body

        const oVal = validarElemento({
            o: nuevoElemento,
            filtrosIDV: [
                "categoriaUI",
            ]
        })
        const categoriaUI = oVal.categoriaUI
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            oVal.testingVI = testingVI
        }
        const categoria = await insertarNuevaCategoria({
            categoriaUI
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