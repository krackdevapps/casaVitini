import { eliminarClienteDelPool } from "../../../repositorio/clientes/eliminarClienteDelPool.mjs"
import { obtenerClientePoolPorPernoctanteUID } from "../../../repositorio/clientes/obtenerClientePoolPorPernoctanteUID.mjs"
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs"
import { obtenerPernoctantesDeLaHabitacion } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctantesDeLaHabitacion.mjs"

export const clientesReserva = async (data) => {

    const reservaUID = data.reservaUID
    const habitacionUID = data.habitacionUID

    const clientes = {
        pernoctantes: [],
        pernoctantesPool: []
    }
    const pernoctanesDeLaHabitacion = await obtenerPernoctantesDeLaHabitacion({
        reservaUID: reservaUID,
        habitacionUID: habitacionUID
    })
    const pernoctantesUID = []
    const pernoctantesPoolUID = []

    for (const pernoctante of pernoctanesDeLaHabitacion) {
        const pernoctanteUID = pernoctante.pernoctanteUID
        const clienteUID = pernoctante.clienteUID
        const fechaCheckIn = pernoctante.fechaCheckIn
        const fechaCheckOutAdelantado = pernoctante.fechaCheckOutAdelantado

        if (clienteUID) {
            await eliminarClienteDelPool(pernoctanteUID)
            const estructura = {
                clienteUID: clienteUID,
                pernoctanteUID: pernoctanteUID,
                fechaCheckIn: fechaCheckIn,
                fechaCheckOutAdelantado: fechaCheckOutAdelantado
            }
            pernoctantesUID.push(estructura)
        } else {
            const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
            if (clientePool.pernoctanteUID) {
                const clientePoolUID = clientePool.clienteUID
                const estructura = {
                    clientePoolUID: clientePoolUID,
                    pernoctanteUID: pernoctanteUID
                }
                pernoctantesPoolUID.push(estructura)
            }
        }
    }

    for (const detallesPernoctanteUID of pernoctantesUID) {
        const clienteUID = detallesPernoctanteUID.clienteUID
        const pernoctanteUID = detallesPernoctanteUID.pernoctanteUID
        const fechaCheckIn = detallesPernoctanteUID.fechaCheckIn || null
        const fechaCheckOutAdelantado = detallesPernoctanteUID.fechaCheckOutAdelantado || null

        const cliente = await obtenerDetallesCliente(clienteUID)
        if (cliente) {
            const primeroApellido = cliente.primerApellido || ""
            const segundoApellido = cliente.segundoApellido || ""
            const nombreCliente = cliente.nombre + " " + primeroApellido + " " + segundoApellido
            const pasaporteCliente = cliente.pasaporte
            const estructuraPernoctante = {
                clienteUID: clienteUID,
                pernoctanteUID: pernoctanteUID,
                nombrePernoctante: nombreCliente,
                pasaportePernoctante: pasaporteCliente,
                fechaCheckIn: fechaCheckIn,
                fechaCheckOutAdelantado: fechaCheckOutAdelantado
            }
            clientes.pernoctantes.push(estructuraPernoctante)

        }
    }
    for (const detallesPernoctantePoolUID of pernoctantesPoolUID) {
        const clientePoolUID = detallesPernoctantePoolUID.clientePoolUID
        const pernoctanteUID = detallesPernoctantePoolUID.pernoctanteUID

        const clientePool = await obtenerClientePoolPorPernoctanteUID(clientePoolUID)
        if (clientePool) {
            const nombreCompleto = clientePool.nombreCompleto
            const pasaporte = clientePool.pasaporte
            const estructuraPernoctante = {
                clientePoolUID: clientePoolUID,
                pernoctanteUID: pernoctanteUID,
                nombrePernoctante: nombreCompleto,
                pasaportePernoctante: pasaporte
            }
            clientes.pernoctantesPool.push(estructuraPernoctante)
        }
    }
    return clientes
}