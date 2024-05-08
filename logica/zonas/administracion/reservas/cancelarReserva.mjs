import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { bloquearApartamentos } from "../../../sistema/bloquearApartamentos.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const cancelarReserva = async (entrada, salida) => {
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
        const tipoBloqueo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueo,
            nombreCampo: "El nombre de tipoBloqueo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
         if (tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "permanente" && tipoBloqueo !== "sinBloqueo") {
            const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo";
            throw new Error(error);
        }
        const validacionReserva = `
                        SELECT 
                        "estadoReserva",
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO"
                        FROM reservas
                        WHERE reserva = $1
                        `;
        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
        if (resuelveValidacionReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        const estadoActualReserva = resuelveValidacionReserva.rows[0].estadoReserva;
        if (estadoActualReserva === "cancelada") {
            const error = "La reserva ya esta cancelada";
            throw new Error(error);
        }

        const eliminarEnlacesDePago = `
                        DELETE FROM "enlacesDePago"
                        WHERE reserva = $1;
                        `;
        await conexion.query(eliminarEnlacesDePago, [reserva]);
        const fechaCancelacion = new Date();
        const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO;
        const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO;
        // extraer todos los apartamentos de la reserva
        const seleccionarApartamentosReserva = `
                        SELECT 
                        uid
                        FROM "reservaApartamentos"
                        WHERE reserva = $1
                        `;
        const resuelveSeleccionarApartamentosReserva = await conexion.query(seleccionarApartamentosReserva, [reserva]);
        const estadoReserva = "cancelada";
        if (resuelveSeleccionarApartamentosReserva.rowCount === 0) {
            const actualizarEstadoReserva = `
                            UPDATE 
                            reservas
                            SET 
                            "estadoReserva" = $1,
                            "fechaCancelacion" = $2
                            WHERE 
                            reserva = $3;`;
            const resuelveActualizarEstadoReserva = await conexion.query(actualizarEstadoReserva, [estadoReserva, fechaCancelacion, reserva]);
            if (resuelveActualizarEstadoReserva.rowCount === 1) {
                const ok = {
                    ok: "La reserva se ha cancelado"
                };
                salida.json(ok);
            }
        }
        if (resuelveSeleccionarApartamentosReserva.rowCount > 0) {
            const apartamentosReserva = resuelveSeleccionarApartamentosReserva.rows;
            for (const apartamento of apartamentosReserva) {
                const metadatos = {
                    reserva: reserva,
                    apartamentoUID: apartamento.uid,
                    tipoBloqueo: tipoBloqueo,
                    fechaEntrada_ISO: fechaEntrada_ISO,
                    fechaSalida_ISO: fechaSalida_ISO,
                    zonaBloqueo: "publico",
                    origen: "cancelacionDeReserva"
                };
                await bloquearApartamentos(metadatos);
            }
            const actualizarEstadoReserva = `
                            UPDATE 
                            reservas
                            SET 
                            "estadoReserva" = $1,
                            "fechaCancelacion" = $2
                            WHERE 
                            reserva = $3;`;
            const resuelveActualizarEstadoReserva = await conexion.query(actualizarEstadoReserva, [estadoReserva, fechaCancelacion, reserva]);
            if (resuelveActualizarEstadoReserva.rowCount === 1) {
                const ok = {
                    ok: "La reserva se ha cancelado"
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