import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const eliminarCheckIN = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        const pernoctantaUID = entrada.body.pernoctanteUID;
        if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
            const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Validar pernoctanteUID
        const validarPernoctante = `
                        SELECT 
                        reserva
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `;
        const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID]);
        if (resuelvePernoctante.rowCount === 0) {
            const error = "No existe el pernoctanteUID";
            throw new Error(error);
        }
        // Validar que el pernoctatne sea cliente y no cliente pool
        const reservaUID = resuelvePernoctante.rows[0].reserva;
        const fechasReserva = `
                        SELECT 
                        "estadoReserva"
                        FROM 
                        reservas
                        WHERE 
                        reserva = $1
                        `;
        const resuelveReserva = await conexion.query(fechasReserva, [reservaUID]);
        if (resuelveReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        // validar que la reserva no este cancelada
        const estadoReserva = resuelveReserva.rows[0].estadoReserva;
        if (estadoReserva === "cancelada") {
            const error = "No se puede alterar una fecha de checkin de una reserva cancelada";
            throw new Error(error);
        }
        const actualizerFechaCheckIn = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckIn" = NULL,
                          "fechaCheckOutAdelantado" = NULL
                        WHERE
                          "pernoctanteUID" = $1;
                        `;
        const actualizarCheckIn = await conexion.query(actualizerFechaCheckIn, [pernoctantaUID]);
        if (actualizarCheckIn.rowCount === 0) {
            const error = "No se ha podido eliminar la fecha de checkin";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha eliminado la fecha de checkin correctamente"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}