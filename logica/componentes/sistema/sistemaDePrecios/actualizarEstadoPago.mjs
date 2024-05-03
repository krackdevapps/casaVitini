import Decimal from "decimal.js"
import { conexion } from "../../db.mjs"
const actualizarEstadoPago = async (reservaUID) => {
    try {
        // Seleccionar el total
        const consultaTotal = `
             SELECT
             "totalConImpuestos"
             FROM 
             "reservaTotales"
             WHERE 
             reserva = $1;`
        const resuelveConsultaTotal = await conexion.query(consultaTotal, [reservaUID])
        const totalReserva = resuelveConsultaTotal.rows[0].totalConImpuestos
        
        // Seleccionar todos los pagos
        const consultaPagos = `
             SELECT
             cantidad
             FROM 
             "reservaPagos"
             WHERE 
             reserva = $1;
             `
        const resuelveConsultaPagos = await conexion.query(consultaPagos, [reservaUID])
        const pagosEntonctrados = resuelveConsultaPagos.rows
        const pagos = pagosEntonctrados.map((pago) => {
            return pago.cantidad
        })
        let totalPagado = "0"
        for (const pago of pagos) {
            totalPagado = new Decimal(totalPagado).plus(pago)
        }
        const faltantePorPagar = new Decimal(totalReserva).minus(totalPagado)
        const totalPagadoDecimal = new Decimal(totalPagado);
        const faltantePorPagarDecimal = new Decimal(faltantePorPagar);
        
        let estadoDelpago
        if (totalPagadoDecimal.equals(0)) {
            estadoDelpago = "noPagado";
        } else if (faltantePorPagarDecimal.equals(0)) {
            estadoDelpago = "pagado";
        } else if (faltantePorPagarDecimal.lessThan(0)) {
            estadoDelpago = "pagadoSuperadamente";
        } else if (faltantePorPagarDecimal.lessThan(totalReserva)) {
            estadoDelpago = "pagadoParcialmente";
        } else {
            const error = "Error en el calculo del estado del pago"
            throw new Error(error)
        }
        
        const consultaActualizaEstdoPago = `
                        UPDATE reservas
                        SET "estadoPago" = $1
                        WHERE reserva = $2;
                        `
        await conexion.query(consultaActualizaEstdoPago, [estadoDelpago, reservaUID])
    } catch (error) {
        throw error
    }
}
export {
    actualizarEstadoPago
}