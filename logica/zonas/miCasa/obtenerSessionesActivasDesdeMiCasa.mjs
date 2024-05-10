import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

export const obtenerSessionesActivasDesdeMiCasa = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return  

        
        const usuarioIDX = entrada.session.usuario;
        await conexion.query('BEGIN'); // Inicio de la transacción

        // validar rol
        const consultaSessionesActivas = `
                SELECT 
                sid AS "sessionIDX",
                to_char(expire, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "caducidadUTC",
                sess->> 'ip' AS ip,
                sess->> 'userAgent' AS "userAgent"
                FROM sessiones
                WHERE sess->> 'usuario' = $1;
                `;
        const resuelveConsultaSessionesActivas = await conexion.query(consultaSessionesActivas, [usuarioIDX]);
        if (resuelveConsultaSessionesActivas.rowCount === 0) {
            const error = "No existe ninguna session activa para este usuario";
            throw new Error(error);
        }
        const calcularTiempoRestante = (fechaObjetivo) => {
            const ahora = DateTime.utc(); // Fecha actual en UTC
            const caducidad = DateTime.fromISO(fechaObjetivo, { zone: 'utc' });
            if (caducidad <= ahora) {
                return "Esta session esta caducada y si no se hace una nueva peticion en la proxima hora con el id de session de esta se destruira";
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
        const sessionesActivas = resuelveConsultaSessionesActivas.rows;
        sessionesActivas.map((detallesSession) => {
            const fechaUTC_ISO = detallesSession.caducidadUTC;
            const fechaObjeto = DateTime.fromISO(detallesSession.caducidadUTC, { zone: 'utc' });
            const fechaFormateada = fechaObjeto.toFormat('dd/MM/yyyy HH:mm:ss');
            detallesSession.caducidadUTC = fechaFormateada;
            detallesSession.tiempoRestante = calcularTiempoRestante(fechaUTC_ISO);
            const ipFormateada = detallesSession.ip.split(":")[detallesSession.ip.split(":").length - 1];
            detallesSession.ip = ipFormateada;
        });
        const ok = {
            ok: "Sessiones activas",
            sessionIDX: entrada.sessionID,
            sessionesActivas: sessionesActivas
        };
        salida.json(ok);
        await conexion.query('COMMIT');
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}