import Decimal from "decimal.js"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { conexion } from "../../componentes/db.mjs"
const obtenerTotalReembolsado = async (reservaUID) => {
    try {
        await validadoresCompartidos.reservas.validarReserva(reservaUID)
        // Obtener todos los pagoUID de la reserva
        const consultaPagosReserva = `
        SELECT
            "pagoUID"
        FROM 
            "reservaPagos"
        WHERE 
            "reserva" = $1;`
        const resolverPagosReserva = await conexion.query(consultaPagosReserva, [reservaUID])
        const contenedorPagosUID = resolverPagosReserva.rows.map((detallesPagoUID) => {
            return detallesPagoUID.pagoUID
        })
        let totalReembolsado = 0
        
            // Obten todos los reembolsos de la reserva        
            for (const pagoUID of contenedorPagosUID) {
                const consultaObtenReembolsoDelPago = `
                SELECT
                cantidad
                FROM 
                "reservaReembolsos"
                WHERE 
                "pagoUID" = $1;`
                const resuelveTotalDelReembolso = await conexion.query(consultaObtenReembolsoDelPago, [pagoUID])
                const reembolsoDelPago = resuelveTotalDelReembolso.rows
                for (const detallesDelReembolso of reembolsoDelPago) {
                    const cantidadDelreembolso = detallesDelReembolso.cantidad                   
                    totalReembolsado = new Decimal(totalReembolsado).plus(cantidadDelreembolso)
                }
            }
        
        return totalReembolsado
    } catch (error) {
        throw error
    }
}
export {
    obtenerTotalReembolsado
}