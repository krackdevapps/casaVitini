import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs"
import { obtenerTitularPoolReservaPorReservaUID } from "../../../repositorio/reservas/titulares/obtenerTitularPoolReservaPorReservaUID.mjs"
import { obtenerTitularReservaPorReservaUID } from "../../../repositorio/reservas/titulares/obtenerTitularReservaPorReservaUID.mjs"
import { eliminarTitularPoolPorReservaUID } from "../../../repositorio/reservas/titulares/eliminarTitularPoolPorReservaUID.mjs"

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
    
            t.clienteUID = titularUID
            t.nombreTitular = nombreTitular
            t.pasaporteTitular = cliente.pasaporte
            t.emailTitular = cliente.mail
            t.telefonoTitular = cliente.telefono
            t.tipoTitularIDV = "titularCliente"
        } else {
            const titularPool = await obtenerTitularPoolReservaPorReservaUID(reservaUID)
            if (titularPool) {
                t.nombreTitular = titularPool.nombreTitular
                t.pasaporteTitular = titularPool.pasaporteTitular
                t.mailTitular = titularPool.mailTitular
                t.telefonoTitular = titularPool.telefonoTitular
                t.tipoTitularIDV = "titularPool" 
            } 
      
        }
        //delete reserva.titularPool
        return t
    } catch (error) {
        throw error
    }
  

}