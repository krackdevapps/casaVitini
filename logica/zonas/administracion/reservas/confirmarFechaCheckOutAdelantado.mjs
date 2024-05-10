import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const confirmarFechaCheckOutAdelantado = async (entrada, salida) => {

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        const pernoctantaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctantaUID,
            nombreCampo: "El identificador universal de pernoctantaUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })
        const fechaCheckOut = entrada.body.fechaCheckOut;
        const fechaCheckOut_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaCheckOut)).fecha_ISO;
        const fechaCheckOut_Objeto = DateTime.fromISO(fechaCheckOut_ISO);
        await conexion.query('BEGIN'); // Inicio de la transacción


        // Validar pernoctanteUID
        const validarPernoctante = `
                        SELECT 
                        reserva,
                        to_char("fechaCheckIn", 'YYYY-MM-DD') as "fechaCheckIn_ISO", 
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
        const fechaCheckIn_ISO = resuelvePernoctante.rows[0].fechaCheckIn_ISO;
        if (!fechaCheckIn_ISO) {
            const error = "No puedes determinar un checkout adelantado a un pernoctante que no ha reazliado el checkin. Primero realiza el checkin";
            throw new Error(error);
        }
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
        if (fechaCheckOut_Objeto >= fechaSalida_Objeto) {
            const error = "La fecha de Checkout adelantado no puede ser superior o igual a la fecha de salida de la reserva, si el checkout se hace el mismo dia que finaliza la reserva no hace falta has un checkout adelantado";
            throw new Error(error);
        }
        if (fechaCheckIn_ISO) {
            const fechaCheckIn_Objeto = DateTime.fromISO(fechaCheckIn_ISO);
            if (fechaCheckIn_Objeto >= fechaCheckOut_Objeto) {
                const error = "La fecha de Checkout no puede ser igual o inferior a la fecha de checkin";
                throw new Error(error);
            }
        }
        if (fechaCheckOut_Objeto <= fechaEntrada_Objeto) {
            const error = "La fecha de Checkout no puede ser inferior o igual a la fecha de entrada de la reserva";
            throw new Error(error);
        }
        const actualizerFechaCheckOut = `
                        UPDATE "reservaPernoctantes"
                        SET
                          "fechaCheckOutAdelantado" = $1
                        WHERE
                          "pernoctanteUID" = $2;
                        `;
        const actualizarCheckOut = await conexion.query(actualizerFechaCheckOut, [fechaCheckOut_ISO, pernoctantaUID]);
        if (actualizarCheckOut.rowCount === 0) {
            const error = "No se ha podido actualziar la fecha de checkout";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado la fecha de checkin correctamente",
            fechaCheckOut: fechaCheckOut
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}