import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";



export const cambiarPernoctanteDeHabitacion = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        mutex = new Mutex();
        await mutex.acquire();


        const reserva = validadoresCompartidos.tipos.numero({
            string: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva (reserva)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const habitacionDestino = validadoresCompartidos.tipos.numero({
            string: entrada.body.habitacionDestino,
            nombreCampo: "El identificador universal de la habitacionDestino (habitacionDestino)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctanteUID (pernoctanteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
        if (resuelveValidacionReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
            const error = "La reserva no se puede modificar por que esta pagada";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
            const error = "La reserva no se puede modificar por que esta reembolsada";
            throw new Error(error);
        }
        const consultaExistenciaCliente = `
                        SELECT 
                        "pernoctanteUID" 
                        FROM
                         "reservaPernoctantes" 
                        WHERE
                        reserva = $1 AND "pernoctanteUID" = $2;`;
        const controlExistencia = await conexion.query(consultaExistenciaCliente, [reserva, pernoctanteUID]);
        if (controlExistencia.rowCount === 0) {
            const error = "No existe el pernoctante, por lo tanto no se puede mover de habitacion";
            throw new Error(error);
        }
        const consultaControlUnicoCliente = `
                            SELECT 
                            "pernoctanteUID" 
                            FROM
                            "reservaPernoctantes" 
                            WHERE
                            reserva = $1 AND habitacion = $2 AND "pernoctanteUID" = $3;
                            `;
        const seleccionaClienteOrigen = await conexion.query(consultaControlUnicoCliente, [reserva, habitacionDestino, pernoctanteUID]);
        if (seleccionaClienteOrigen.rowCount > 0) {
            const error = "Ya existe el cliente en esta habitacion";
            throw new Error(error);
        }
        const actualizaNuevaPosicionClientePool = `
                            UPDATE 
                            "reservaPernoctantes"
                            SET
                            habitacion = $1
                            WHERE
                            reserva = $2 AND "pernoctanteUID" = $3;
                            `;
        const actualizaClientePoolDestino = await conexion.query(actualizaNuevaPosicionClientePool, [habitacionDestino, reserva, pernoctanteUID]);
        if (actualizaClientePoolDestino.rowCount === 0) {
            const error = "Ha ocurrido un error al intentar actualiza el cliente pool en el destino";
            throw new Error(error);
        }
        if (actualizaClientePoolDestino.rowCount === 1) {
            const ok = {
                ok: "Se ha cambiado correctamente al pernoctante de alojamiento dentro de la reserva "
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}