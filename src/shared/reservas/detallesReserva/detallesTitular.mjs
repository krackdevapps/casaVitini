import { obtenerDetallesCliente } from "../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs"
import { obtenerTitularPoolReservaPorReservaUID } from "../../../infraestructure/repository/reservas/titulares/obtenerTitularPoolReservaPorReservaUID.mjs"
import { obtenerTitularReservaPorReservaUID } from "../../../infraestructure/repository/reservas/titulares/obtenerTitularReservaPorReservaUID.mjs"
import { eliminarTitularPoolPorReservaUID } from "../../../infraestructure/repository/reservas/titulares/eliminarTitularPoolPorReservaUID.mjs"

export const detallesTitular = async (reservaUID) => {

    try {
        const titular = await obtenerTitularReservaPorReservaUID(reservaUID)

        const titularUID = titular?.titularUID
        const clienteUID = titular?.clienteUID

        const t = {}
        if (titularUID) {
            await eliminarTitularPoolPorReservaUID(reservaUID)
            const cliente = await obtenerDetallesCliente(clienteUID)

            const nombre = cliente.nombre
            const primerApellido = cliente.primerApellido
            const segundoApellido = cliente.segundoApellido
            const nombreTitular = `${nombre} ${primerApellido} ${segundoApellido}`

            t.titularUID = titularUID
            t.clienteUID = clienteUID
            t.nombreTitular = nombreTitular
            t.pasaporteTitular = cliente.pasaporte
            t.mailTitular = cliente.mail
            t.telefonoTitular = cliente.telefono
            t.tipoTitularIDV = "titularCliente"
        } else {
            const titularPool = await obtenerTitularPoolReservaPorReservaUID(reservaUID)
            if (titularPool) {
                t.titularPoolUID = titularPool.titularPoolUID
                t.nombreTitular = titularPool.nombreTitular
                t.pasaporteTitular = titularPool.pasaporteTitular
                t.mailTitular = titularPool.mailTitular
                t.telefonoTitular = titularPool.telefonoTitular
                t.tipoTitularIDV = "titularPool"
            }
        }
        return t
    } catch (error) {
        throw error
    }


}