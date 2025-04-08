import { actualizarElementoPorElementoUID } from "../../../infraestructure/repository/inventario/actualizarElementoPorElementoUID.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";


export const actualizarElemento = async (entrada) => {
    try {


        const actualizarElemento = entrada.body


        const elementoValidado = validarElemento({
            o: actualizarElemento,
            filtrosIDV: [
                "nombre",
                "tipoLimite",
                "cantidadMinima",
                "descripcion",
                "elementoUID"
            ]
        })

        const elementoUID = elementoValidado?.elementoUID
        if (!elementoUID) {
            throw new Error("Falta la llave elementoUID con una cadena con numeros enteros")
        }

        const elemento = await actualizarElementoPorElementoUID({
            nombre: elementoValidado.nombre,
            tipoLimite: elementoValidado.tipoLimite,
            cantidadMinima: elementoValidado.cantidadMinima,
            descripcion: elementoValidado.descripcion,
            elementoUID: elementoValidado.elementoUID
        })

        const ok = {
            ok: "Se ha creado el nuevo elemento en el inventario",
            elementoUID: elemento.UID
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}