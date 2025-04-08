import { actualizarCantidadPorElementoUID } from "../../infraestructure/repository/inventario/actualizarCantidadPorElementoUID.mjs"
import Decimal from "decimal.js"
import { eliminarFilaRegistroPorUID } from "../../infraestructure/repository/inventario/eliminarFilaRegistroPorUID.mjs"
import { obtenerRegistroPorUID } from "../../infraestructure/repository/inventario/obtenerRegistroPorUID.mjs"
import { obtenerElementoPorElementoUID } from "../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs"

export const reversionDeMovimiento = async (data) => {
    try {
        const registroUID = data.registroUID
        const registro = await obtenerRegistroPorUID({
            registroUID,
            errorSi: "desactivado"
        })
        if (registro) {

            const cantidadEnMovimiento_enRegistro = registro.cantidadEnMovimiento
            const sentidoMovimiento = registro.sentidoMovimiento
            const elementoUID = registro.elementoUID
            const elemento = await obtenerElementoPorElementoUID({
                elementoUID: elementoUID,
                errorSi: "noExiste"
            })
            const cantidaEnInventario = elemento.cantidad
            let cantidadDiferencial

            if (sentidoMovimiento === "extraer") {
                cantidadDiferencial = new Decimal(cantidaEnInventario).plus(cantidadEnMovimiento_enRegistro).abs()
            } else if (sentidoMovimiento === "insertar") {
                cantidadDiferencial = new Decimal(cantidaEnInventario).minus(cantidadEnMovimiento_enRegistro).abs()
            } else {
                throw new Error(`Error en sentido del movimiento`)
            }
            await eliminarFilaRegistroPorUID(registroUID)
            cantidadDiferencial = cantidadDiferencial < 0 ? 0 : cantidadDiferencial
            const ok = {}
            await actualizarCantidadPorElementoUID({
                elementoUID,
                cantidad: String(cantidadDiferencial)
            })
            return ok
        } 

    } catch (error) {
        throw error
    }
}