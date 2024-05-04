import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const confirmarFechaCheckIn = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return
  

        const pernoctantaUID = entrada.body.pernoctanteUID;
        const fechaCheckIn = entrada.body.fechaCheckIn;
        if (typeof pernoctantaUID !== "number" || !Number.isInteger(pernoctantaUID) || pernoctantaUID <= 0) {
            const error = "El campo 'pernoctantaUID' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        const fechaCheckIn_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaCheckIn)).fecha_ISO;
        const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn_ISO);
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Validar pernoctanteUID
        const validarPernoctante = `
                        SELECT 
                        reserva,
                        to_char("fechaCheckOutAdelantado", 'YYYY-MM-DD') as "checkoutAdelantado_ISO", 
                        "clienteUID"
                        FROM "reservaPernoctantes"
                        WHERE "pernoctanteUID" = $1
                        `;
        const resuelvePernoctante = await conexion.query(validarPernoctante, [pernoctantaUID]);
        if (resuelvePernoctante.rowCount === 0) {
            const error = "No existe el pernoctanteUID";
            throw new Error(error);
        }
        // Validar que el pernoctatne sea cliente y no cliente pool
        const clienteUID = resuelvePernoctante.rows[0].clienteUID;
        if (!clienteUID) {
            const error = "El pernoctante esta pendiente de validacion documental. Valide primero la documentacion antes de hacer el checkin";
            throw new Error(error);
        }
        const reservaUID = resuelvePernoctante.rows[0].reserva;
        const checkoutAdelantado_ISO = resuelvePernoctante.rows[0].checkoutAdelantado_ISO;
        const fechasReserva = `
                        SELECT 
                        "estadoReserva",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
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
        const fechaEntrada_ISO = resuelveReserva.rows[0].fechaEntrada_ISO;
        const fechaEntrada_Objeto = DateTime.fromISO(fechaEntrada_ISO);
        const fechaSalida_ISO = resuelveReserva.rows[0].fechaSalida_ISO;
        const fechaSalida_Objeto = DateTime.fromISO(fechaSalida_ISO);
        if (fechaCheckIn_Objeto < fechaEntrada_Objeto) {
            const error = "La fecha de Checkin no puede ser inferior a la fecha de entrada de la reserva";
            throw new Error(error);
        }
        if (checkoutAdelantado_ISO) {
            const checkoutAdelantado_Objeto = DateTime.fromISO(checkoutAdelantado_ISO);
            if (fechaCheckIn_Objeto >= checkoutAdelantado_Objeto) {
                const error = "La fecha de Checkin no puede ser igual o superior a la fecha de checkout adelantado";
                throw new Error(error);
            }
        }
        if (fechaCheckIn_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de Checkin no puede ser igual o superior a la fecha de salida de la reserva";
            throw new Error(error);
        }
        const actualizerFechaCheckIn = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckIn" = $1
                        WHERE
                          "pernoctanteUID" = $2;
                        `;
        const actualizarCheckIn = await conexion.query(actualizerFechaCheckIn, [fechaCheckIn_ISO, pernoctantaUID]);
        if (actualizarCheckIn.rowCount === 0) {
            const error = "No se ha podido actualziar la fecha de checkin";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado la fecha de checkin correctamente",
            fechaCheckIn: fechaCheckIn
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