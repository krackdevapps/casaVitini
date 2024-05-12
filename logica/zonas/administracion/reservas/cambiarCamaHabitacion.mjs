import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const cambiarCamaHabitacion = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        mutex = new Mutex();
        await mutex.acquire();

        const reserva = validadoresCompartidos.tipos.numero({
            number: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva (reserva)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const habitacion = validadoresCompartidos.tipos.numero({
            number: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitacion (habitacion)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const nuevaCama = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaCama,
            nombreCampo: "El nuevaCama",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        // Valida reserva
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
        // valida que la habitacion exista dentro de la reserva
        const consultaValidacionHabitacion = `
                        SELECT uid 
                        FROM "reservaHabitaciones" 
                        WHERE reserva = $1 AND uid = $2;`;
        const resuelveconsultaValidacionHabitacion = await conexion.query(consultaValidacionHabitacion, [reserva, habitacion]);
        if (resuelveconsultaValidacionHabitacion?.rowCount === 0) {
            const error = "No existe la habitacion dentro de la reserva";
            throw new Error(error);
        }
        // valida camaIDV que entra
        const consultaValidacionCamaIDV = `
                        SELECT "camaUI" 
                        FROM camas 
                        WHERE cama = $1;`;
        const resuelveConsultaValidacionCamaIDV = await conexion.query(consultaValidacionCamaIDV, [nuevaCama]);
        if (resuelveConsultaValidacionCamaIDV?.rowCount === 0) {
            const error = "No exist el camaIDV introducido en el campo nuevaCama";
            throw new Error(error);
        }
        // Valida que la cama existe dentro de la reserva
        const resolucionNombreCama = await conexion.query(`SELECT "camaUI" FROM camas WHERE cama = $1`, [nuevaCama]);
        if (resolucionNombreCama.rowCount === 0) {
            const error = "No existe el identificador de la camaIDV";
            throw new Error(error);
        }
        const camaUI = resolucionNombreCama.rows[0].camaUI;
        const consultaExistenciaCama = `
                        SELECT uid 
                        FROM "reservaCamas" 
                        WHERE reserva = $1 AND habitacion = $2;`;
        const resuelveconsultaExistenciaCama = await conexion.query(consultaExistenciaCama, [reserva, habitacion]);
        if (resuelveconsultaExistenciaCama.rowCount === 1) {
            const consultaActualizaCama = `
                            UPDATE "reservaCamas"
                            SET
                            cama = $3,
                            "camaUI" = $4
                            WHERE reserva = $1 AND habitacion = $2;`;
            const resueleConsultaActualizaCama = await conexion.query(consultaActualizaCama, [reserva, habitacion, nuevaCama, camaUI]);
            if (resueleConsultaActualizaCama?.rowCount === 1) {
                const ok = {
                    "ok": "Se ha actualizado correctamten la cama"
                };
                salida.json(ok);
            }
        }
        if (resuelveconsultaExistenciaCama.rowCount === 0) {
            const insertaNuevaCama = `
                            INSERT INTO "reservaCamas"
                            (
                            reserva,
                            habitacion,
                            cama,
                            "camaUI"
                            )
                            VALUES ($1, $2, $3, $4) RETURNING uid
                            `;
            const resuelveInsertaNuevaCama = await conexion.query(insertaNuevaCama, [reserva, habitacion, nuevaCama, camaUI]);
            if (resuelveInsertaNuevaCama.rowCount === 1) {
                const ok = {
                    "ok": "Se ha anadido correctamente la nueva a la habitacion",
                    "nuevoUID": resuelveInsertaNuevaCama.rows[0].uid
                };
                salida.json(ok);
            }
        }
        salida.end();
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {

        if (mutex) {
            mutex.release()
        }
    }
}