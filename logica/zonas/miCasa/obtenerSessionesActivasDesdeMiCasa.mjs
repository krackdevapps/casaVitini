import { DateTime } from "luxon";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";

import { obtenerSessionesActivasPorUsuario } from "../../repositorio/sessiones/obtenerSessionesActivasPorUsuario.mjs";
import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";

export const obtenerSessionesActivasDesdeMiCasa = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()


        const usuarioIDX = entrada.session.usuario;
        await campoDeTransaccion("iniciar")

        const sessionesActivasDelUsuario = await obtenerSessionesActivasPorUsuario(usuarioIDX)
        if (sessionesActivasDelUsuario.length === 0) {
            const error = "No existe ninguna sesión activa para este usuario.";
            throw new Error(error);
        }
        const calcularTiempoRestante = (fechaObjetivo) => {
            const ahora = DateTime.utc(); // Fecha actual en UTC
            const caducidad = DateTime.fromISO(fechaObjetivo, { zone: 'utc' });
            if (caducidad <= ahora) {
                return "Esta sesión está caducada y si no se hace una nueva petición en la próxima hora, la sesión sera destruida";
            }
            const diferencia = caducidad.diff(ahora);
            if (diferencia.as('days') >= 2) {
                return `Quedan ${Math.floor(diferencia.as('days'))} días`;
            } else if (diferencia.as('hours') >= 1) {
                return `Quedan ${Math.floor(diferencia.as('hours'))} horas y ${Math.floor(diferencia.as('minutes') % 60)} minutos`;
            } else {
                return `Quedan ${Math.floor(diferencia.as('minutes'))} minutos`;
            }
        };
        sessionesActivasDelUsuario.forEach((detallesSession) => {
            const fechaUTC_ISO = detallesSession.caducidadUTC;
            const fechaObjeto = DateTime.fromISO(detallesSession.caducidadUTC, { zone: 'utc' });
            const fechaFormateada = fechaObjeto.toFormat('dd/MM/yyyy HH:mm:ss');
            detallesSession.caducidadUTC = fechaFormateada;
            detallesSession.tiempoRestante = calcularTiempoRestante(fechaUTC_ISO);
            const ipFormateada = detallesSession.ip.split(":")[detallesSession.ip.split(":").length - 1];
            detallesSession.ip = ipFormateada;
        });
        await campoDeTransaccion("confirmar");
        const ok = {
            ok: "Sesiones activas",
            sessionIDX: entrada.sessionID,
            sessionesActivas: sessionesActivasDelUsuario
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorCapturado
    }
}