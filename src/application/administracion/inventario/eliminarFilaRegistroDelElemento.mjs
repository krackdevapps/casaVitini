import Decimal from "decimal.js";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarCantidadPorElementoUID } from "../../../infraestructure/repository/inventario/actualizarCantidadPorElementoUID.mjs";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";
import { obtenerRegistroPorUID } from "../../../infraestructure/repository/inventario/obtenerRegistroPorUID.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validarElemento } from "../../../shared/inventario/validarElemento.mjs";
import { eliminarFilaRegistroPorUID } from "../../../infraestructure/repository/inventario/eliminarFilaRegistroPorUID.mjs";
import { controladorDelMovimiento } from "../../../shared/inventario/controladorDeMovimiento.mjs";

export const eliminarFilaRegistroDelElemento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()


        const oVal = await validarElemento({
            o: entrada.body,
            filtrosIDV: ["uid"]
        })
        await campoDeTransaccion("iniciar")
        const uid = oVal.uid
        const registro = await obtenerRegistroPorUID({
            registroUID: uid,
            errorSi: "noExiste"
        })

        const cantidadEnMovimiento = registro.cantidadEnMovimiento
        const sentidoMovimiento = registro.sentidoMovimiento
        const elementoUID = registro.elementoUID

        const elemento = await obtenerElementoPorElementoUID(elementoUID)
        const cantidaEnInventario = elemento.cantidad


        // Operacion de reversion
        let cantidaActualizada
        if (sentidoMovimiento === "extraer") {
            cantidaActualizada = new Decimal(cantidaEnInventario).plus(cantidadEnMovimiento)

        } else if (sentidoMovimiento === "insertar") {
            cantidaActualizada = new Decimal(cantidaEnInventario).minus(cantidadEnMovimiento)
        }

        cantidaActualizada = cantidaActualizada < 0 ? 0 : cantidaActualizada
        await actualizarCantidadPorElementoUID({
            cantidad: String(cantidaActualizada),
            elementoUID: elementoUID
        })

        await eliminarFilaRegistroPorUID(uid)

        await controladorDelMovimiento({
            elementoUID,
            operacionIDV: "reversion",
            origenReversion: "elementoUID"

        })


        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la fila del registro del elemento",
            uid
        }

        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorCapturado
    }
}