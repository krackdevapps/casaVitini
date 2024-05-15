import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const eliminarPernoctanteReserva = async (entrada, salida) => {
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
        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctante (pernoctanteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const tipoElinacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoElinacion,
            nombreCampo: "El tipoElinacion",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (typeof tipoElinacion !== "string" || (tipoElinacion !== "habitacion" && tipoElinacion !== "reserva")) {
            const error = "El campo 'tipoElinacion' solo puede ser 'habitacion' o 'reserva'";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")


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
        // validar habitacion
        const validarCliente = `
                            SELECT 
                            "pernoctanteUID"
                            FROM
                            "reservaPernoctantes"
                            WHERE
                            reserva = $1 AND "pernoctanteUID" = $2
                            `;
        const resuelveValidarCliente = await conexion.query(validarCliente, [reserva, pernoctanteUID]);
        if (resuelveValidarCliente.rowCount === 0) {
            const error = "No existe el pernoctante en la reserva";
            throw new Error(error);
        }
        const eliminaClientePool = `
                            DELETE FROM "poolClientes"
                            WHERE "pernoctanteUID" = $1;
                            `;
        await conexion.query(eliminaClientePool, [pernoctanteUID]);
        let sentenciaDinamica;
        if (tipoElinacion === "habitacion") {
            sentenciaDinamica = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND "pernoctanteUID" = $2 ;
                            `;
        }
        if (tipoElinacion === "reserva") {
            sentenciaDinamica = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE reserva = $1 AND "pernoctanteUID" = $2;
                            `;
        }
        const actualicarPernoctante = await conexion.query(sentenciaDinamica, [reserva, pernoctanteUID]);
        if (actualicarPernoctante.rowCount === 0) {
            const error = "No existe el pernoctante en la reserva, por lo tanto no se puede actualizar";
            throw new Error(error);
        }
        if (actualicarPernoctante.rowCount === 1) {
            let ok;
            if (tipoElinacion === "habitacion") {
                ok = {
                    "ok": "Se ha eliminado al pernoctante de la habitacion"
                };
            }
            if (tipoElinacion === "reserva") {
                ok = {
                    "ok": "Se ha eliminar al pernoctante de la reserva"
                };
            }
            salida.json(ok);
        }
        await campoDeTransaccion("confirmar")
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}