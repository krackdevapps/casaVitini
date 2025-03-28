import { DateTime } from "luxon"
import { actualizarCantidadPorElementoUID } from "../../infraestructure/repository/inventario/actualizarCantidadPorElementoUID.mjs"
import { insertarRegistro } from "../../infraestructure/repository/inventario/insertarRegistro.mjs"
import Decimal from "decimal.js"
import { obtenerElementoPorElementoUID } from "../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs"

export const controladorDelMovimiento = async (data) => {
    try {
        const elementoUID = data.elementoUID
        let cantidadEnMovimiento = data.cantidadEnMovimiento
        const operacionIDV = data.operacionIDV

        const elemento = await obtenerElementoPorElementoUID(elementoUID)
        if (!elemento) {
            throw new Error(`No existe el elemento en el inventario con el elemenotuID ${elementoUID}`)
        }
        const cantidaEnInventario = elemento.cantidad
        const nombre = elemento.nombre

        const operacionesInsercion = [
            "elementoHaciaAReserva",
            "elementoHaciaAlojamiento"
        ]
        let cantidadDiferencial
        let sentidoMovimiento

        if (operacionIDV === "elementoCreado") {
            sentidoMovimiento = "insertar"
            cantidadDiferencial = new Decimal(cantidadEnMovimiento).plus(cantidaEnInventario).abs()
        } if (operacionesInsercion.includes(operacionIDV)) {
            sentidoMovimiento = "extraer"
            cantidadDiferencial = new Decimal(cantidadEnMovimiento).minus(cantidaEnInventario).abs()


        } else if (operacionIDV === "insertarEnInventario") {
            sentidoMovimiento = "insertar"
            cantidadDiferencial = new Decimal(cantidadEnMovimiento).plus(cantidaEnInventario).abs()
        } else if (operacionIDV === "extraerEnInventario") {
            if (Number(cantidadEnMovimiento) > Number(cantidaEnInventario)) {
                throw new Error(`No puedes extraer mas de ${cantidaEnInventario}, que es la cantidad actual del ${nombre}`)
            }
            sentidoMovimiento = "extraer"
            cantidadDiferencial = new Decimal(cantidaEnInventario).minus(cantidadEnMovimiento).abs()

        } else {
            throw new Error("operacionIDV no reconocido")
        }
        cantidadDiferencial = cantidadDiferencial < 0 ? 0 : cantidadDiferencial

        const ok = {}


        const nuevoRegistro = await insertarRegistro({
            elementoUID: elementoUID,
            cantidadEnMovimiento: String(cantidadEnMovimiento),
            fecha: DateTime.now().toISO(),
            operacionIDV,
            sentidoMovimiento
        })
        ok.nuevoRegistro = nuevoRegistro

        await actualizarCantidadPorElementoUID({
            elementoUID,
            cantidad: String(cantidadDiferencial)
        })
        return ok

    } catch (error) {
        throw error
    }

}