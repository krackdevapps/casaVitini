import { actualizarElementoPorElementoUID } from "../../../infraestructure/repository/inventario/actualizarElementoPorElementoUID.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";

export const actualizarElemento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const actualizarElemento = entrada.body


        const elementoValidado = validarElemento({
            o: actualizarElemento,
            filtrosIDV: [
                "nombre",
                "cantidad",
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
            cantidad: elementoValidado.cantidad,
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