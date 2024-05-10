import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const eliminarHabitacionReserva = async (entrada, salida) => {
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
            number: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        // apartamentoUID
        const habitacion = validadoresCompartidos.tipos.numero({
            number: entrada.body.habitacion,
            nombreCampo: "El identificador universal de la habitacion ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const pernoctantes = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pernoctantes,
            nombreCampo: "El pernoctantes",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (pernoctantes !== "conservar" && pernoctantes !== "eliminar") {
            const error = "El campo 'pernoctantes' solo puede ser 'conservar', 'mantener'";
            throw new Error(error);
        }
        // Comprobar que la reserva exisste
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
        // validar habitacion
        const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `;
        const resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacion]);
        if (resuelveValidacionHabitacion.rowCount === 0) {
            const error = "No existe la habitacion dentro de la reserva";
            throw new Error(error);
        }
        const ok = {};
        if (pernoctantes === "eliminar") {
            const eliminarPernoctantes = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE habitacion = $1 AND reserva = $2;
                            `;
            const resuelveEliminarPernoctantes = await conexion.query(eliminarPernoctantes, [habitacion, reserva]);
            ok.ok = "Se ha eliminado al habitacion correctamente y los pernoctanes que contenia"

        }
        const eliminaHabitacionReserva = `
                        DELETE FROM "reservaHabitaciones"
                        WHERE uid = $1 AND reserva = $2;
                        `;
        const resuelveEliminaHabitacionReserva = await conexion.query(eliminaHabitacionReserva, [habitacion, reserva]);
        if (pernoctantes === "conservar") {
            const desasignaPernoctanteDeHabitacion = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND habitacion = $2;
                            `;
            await conexion.query(desasignaPernoctanteDeHabitacion, [reserva, habitacion]);
            ok.ok = "Se ha eliminado al habitacion correctamente pero los pernoctantes que contenia siguen asignados a la reserva"

        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()

        }
    }
}