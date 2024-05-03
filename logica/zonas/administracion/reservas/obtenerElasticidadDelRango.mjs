import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { validarModificacionRangoFechaResereva } from "../../../sistema/validadores/validarModificacionRangoFechaResereva.mjs";


export const obtenerElasticidadDelRango = async (entrada, salida) => {
    const mutex = new Mutex();
    const bloqueoModificarFechaReserva = await mutex.acquire();
    try {
        const reserva = entrada.body.reserva;
        const sentidoRango = entrada.body.sentidoRango;
        const mesCalendario = entrada.body.mesCalendario;
        const anoCalendario = entrada.body.anoCalendario;
        if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
            const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
            throw new Error(error);
        }
        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro";
            throw new Error(error);
        }
        const regexMes = /^\d{2}$/;
        const regexAno = /^\d{4,}$/;
        if (!regexAno.test(anoCalendario)) {
            const error = "El año (anoCalenadrio) debe de ser una cadena de cuatro digitos. Por ejemplo el año uno se escribiria 0001";
            throw new Error(error);
        }
        if (!regexMes.test(mesCalendario)) {
            const error = "El mes (mesCalendario) debe de ser una cadena de dos digitos, por ejemplo el mes de enero se escribe 01";
            throw new Error(error);
        }
        const mesNumeroControl = parseInt(mesCalendario, 10);
        const anoNumeroControl = parseInt(anoCalendario, 10);
        if (mesNumeroControl < 1 && mesNumeroControl > 12 && anoNumeroControl < 2000) {
            const error = "Revisa los datos de mes por que debe de ser un numero del 1 al 12";
            throw new Error(error);
        }
        if (anoNumeroControl < 2000 || anoNumeroControl > 5000) {
            const error = "El año no puede ser inferior a 2000 ni superior a 5000";
            throw new Error(error);
        }
        const metadatos = {
            reserva: reserva,
            sentidoRango: sentidoRango,
            anoCalendario: anoCalendario,
            mesCalendario: mesCalendario
        };
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
        const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
        const ok = {
            ok: transaccionInterna
        };
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        bloqueoModificarFechaReserva();
    }
}