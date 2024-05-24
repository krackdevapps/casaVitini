import { obtenerClientePoolPorPernoctanteUID } from "../../../repositorio/pool/obtenerClientePoolPorPernoctanteUID.mjs"
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs"
import { obtenerPernoctantesSinHabitacion } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctantesSinHabitacion.mjs"

export const recuperarClientesSinHabitacionAsignada = async (reservaUID) => {
    const estructuraFinal = {
        pernoctantes: [],
        pernoctantesPool: []
    }
    const pernoctantes = await obtenerPernoctantesSinHabitacion(reservaUID)
    for (const pernoctante of pernoctantes) {
        const pernoctanteUID = pernoctante.pernoctanteUID
        const clienteUID = pernoctante.clienteUID
        const fechaCheckIn = pernoctante.fechaCheckIn
        const fechaCheckOutAdelantado = pernoctante.fechaCheckOutAdelantado

        if (clienteUID) {
            const cliente = await obtenerDetallesCliente(clienteUID)
            if (cliente) {
                const primeroApellido = cliente.primerApellido ? cliente.primerApellido : ""
                const segundoApellido = cliente.segundoApellido ? cliente.segundoApellido : ""
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
                estructuraFinal.pernoctantes.push(estructuraPernoctante)
            }

        } else {
            const clientePool = await obtenerClientePoolPorPernoctanteUID(pernoctanteUID)
            if (clientePool) {
                const nombreCompleto = clientePool.nombreCompleto
                const pasaporte = clientePool.pasaporte
                const estructuraPernoctante = {
                    clienteUID: clienteUID,
                    pernoctanteUID: pernoctanteUID,
                    nombrePernoctante: nombreCompleto,
                    pasaportePernoctante: pasaporte
                }
                estructuraFinal.pernoctantesPool.push(estructuraPernoctante)
            }
        }
    }
    return estructuraFinal
}
