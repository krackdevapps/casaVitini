import { DateTime } from "luxon";
import { actualizarCantidadPorElementoUID } from "../../../infraestructure/repository/inventario/actualizarCantidadPorElementoUID.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { insertarRegistro } from "../../../infraestructure/repository/inventario/insertarRegistro.mjs";
import { operacionesRegistro } from "../../../shared/inventario/traductorOperacionIDV.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";
import Decimal from "decimal.js";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";
import { E_ALREADY_LOCKED } from "async-mutex";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { controladorDelMovimiento } from "../../../shared/inventario/controladorDeMovimiento.mjs";

export const actualizarCantidadDelElemento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const actualizarElemento = entrada.body
        const elementoValidado = validarElemento({
            o: actualizarElemento,
            filtrosIDV: [
                "cantidad",
                "elementoUID",
                "operacionIDV"
            ]
        })

        const elementoUID = elementoValidado?.elementoUID
        if (!elementoUID) {
            throw new Error("Falta la llave elementoUID con una cadena con numeros enteros")
        }
        const elemento = await obtenerElementoPorElementoUID(elementoUID)
        const cantidadEntrada = elementoValidado.cantidad
        const operacionIDV = elementoValidado.operacionIDV

        await campoDeTransaccion("iniciar")
        await controladorDelMovimiento({
            elementoUID,
            cantidadEnMovimiento: cantidadEntrada,
            operacionIDV: operacionIDV
        })
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizaro la cantidad del elemento en el inventario",
            elementoUID: elemento.UID
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}