import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const detallesDelPernoctantePorComprobar = async (entrada, salida) => {
    try {


        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const reservaUID = entrada.body.reservaUID;
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const pernoctanteUID = entrada.body.pernoctanteUID;
        if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
            const error = "El campo 'pernoctanteUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        const validarPernoctante = `
                        SELECT 
                        "clienteUID"
                        FROM 
                        "reservaPernoctantes" 
                        WHERE
                        reserva = $1 AND "pernoctanteUID" = $2;`;
        const resulveValidarPernoctante = await conexion.query(validarPernoctante, [reservaUID, pernoctanteUID]);
        if (resulveValidarPernoctante.rowCount === 0) {
            const error = "No existe ningun pernoctante con ese UID dentro del la reserva";
            throw new Error(error);
        }
        if (resulveValidarPernoctante.rowCount === 1) {
            const clienteUID = resulveValidarPernoctante.rows[0].clienteUID;
            if (clienteUID) {
                const error = "El pernoctante ya ha pasado el proceso de comporbacion";
                throw new Error(error);
            } else {
                const datosClientePool = `
                                SELECT 
                                "nombreCompleto",
                                pasaporte
                                FROM 
                                "poolClientes" 
                                WHERE
                                "pernoctanteUID" = $1;`;
                const resuelveClientePool = await conexion.query(datosClientePool, [pernoctanteUID]);
                const nombreCompleto = resuelveClientePool.rows[0].nombreCompleto;
                const pasaporte = resuelveClientePool.rows[0].pasaporte;
                const ok = {
                    pernoctanteUID: pernoctanteUID,
                    nombreCompleto: nombreCompleto,
                    pasaporte: pasaporte
                };
                salida.json(ok);
            }
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}