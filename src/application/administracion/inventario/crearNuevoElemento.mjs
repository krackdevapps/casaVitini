import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { insertarElemento } from "../../../infraestructure/repository/inventario/insertarElemento.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";
import { insertarRegistro } from "../../../infraestructure/repository/inventario/insertarRegistro.mjs";
import { DateTime } from "luxon";
import { operacionesRegistro } from "../../../shared/inventario/traductorOperacionIDV.mjs";

export const crearNuevoElemento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const nuevoElemento = entrada.body

        const elementoValidado = validarElemento({
            o: nuevoElemento,
            filtrosIDV: [
                "nombre",
                "cantidad",
                "tipoLimite",
                "cantidadMinima",
                "descripcion",
            ]
        })

        const elemento = await insertarElemento({
            nombre: elementoValidado.nombre,
            cantidad: elementoValidado.cantidad,
            tipoLimite: elementoValidado.tipoLimite,
            cantidadMinima: elementoValidado.cantidadMinima,
            descripcion: elementoValidado.descripcion,
        })

        const operacionIDV = "elementoCreado"
        operacionesRegistro({
            operacionIDV,
            funcion: "comprobarIDV",
        })

        await insertarRegistro({
            elementoUID: elemento.UID,
            mensajeUI: "Se ha creado el elemento en el inventario",
            cantidadEnMovimiento: elemento.cantidad,
            fecha: DateTime.now().toISO(),
            operacionIDV,
            sentidoMovimiento: "insertar"
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