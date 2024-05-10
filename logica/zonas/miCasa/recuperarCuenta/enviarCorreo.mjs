import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { enviarMail } from "../../../sistema/Mail/enviarMail.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";


export const enviarCorreo = async (entrada, salida) => {
    try {

        const email = validadoresCompartidos.tipos
            .correoElectronico(entrada.body.email)

        const generarCadenaAleatoria = (longitud) => {
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };
        const validarQueElCodigoEsUnico = async (codigoAleatorio) => {
            const validarCodigoAleatorio = `
                SELECT
                codigo
                FROM "enlaceDeRecuperacionCuenta"
                WHERE codigo = $1;`;
            const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio]);
            if (resuelveValidarCodigoAleatorio.rowCount > 0) {
                return true;
            }
        };
        const controlCodigo = async () => {
            const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
            let codigoGenerado;
            let codigoExiste;
            do {
                codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                codigoExiste = await validarQueElCodigoEsUnico(codigoGenerado);
            } while (codigoExiste);
            // En este punto, tenemos un código único que no existe en la base de datos
            return codigoGenerado;
        };
        const codigoGenerado = await controlCodigo();
        const fechaActualUTC = DateTime.utc();
        const fechaCaducidadUTC = fechaActualUTC.plus({ hours: 1 });
        const hostActual = process.env.HOST_CASAVITINI;
        await conexion.query('BEGIN'); // Inicio de la transacción
        const consultaRecuperarCuenta = `
                SELECT "usuarioIDX"
                FROM "datosDeUsuario"
                WHERE "email" = $1;
                `;
        const resuelveActualizarIDX = await conexion.query(consultaRecuperarCuenta, [email]);
        if (resuelveActualizarIDX.rowCount === 0) {
            const error = "La dirección de correo electrònico no consta en nínguna cuenta de usuario. Registrate y crea tu VitiniID si lo neceistas.";
            throw new Error(error);
        }
        const usuarioIDX = resuelveActualizarIDX.rows[0].usuarioIDX;
        // Comporbar si es una recuperacion de contraseña o una verificacion de email
        const consultaEstadoVerificacionCuenta = `
            SELECT 
            "cuentaVerificada",
            usuario
            FROM
            usuarios
            WHERE
            usuario = $1;
            `;
        const resuelveEstadoVerificacion = await conexion.query(consultaEstadoVerificacionCuenta, [usuarioIDX]);
        if (resuelveEstadoVerificacion.rowCount === 0) {
            const error = "No existe esta cuenta de usuario";
            throw new Error(error);
        }
        const estadoVerificacion = resuelveEstadoVerificacion.rows[0].cuentaVerificada;
        const usuario = resuelveEstadoVerificacion.rows[0].usuario;


        if (estadoVerificacion === "si") {
            // Cuenta verificada, se busca recuperar, es decir restablecer la clave
            if (resuelveActualizarIDX.rowCount === 1) {
                const borrarEnlacesAntiguos = `
                    DELETE FROM "enlaceDeRecuperacionCuenta"
                    WHERE usuario = $1;`;
                await conexion.query(borrarEnlacesAntiguos, [usuarioIDX]);
                const consultaCrearEnlace = `
                    INSERT INTO "enlaceDeRecuperacionCuenta"
                    (
                    usuario,
                    codigo,
                    "fechaCaducidad"
                    )
                    VALUES
                    ($1, $2, $3)
                    RETURNING
                    codigo
                    `;
                await conexion.query(consultaCrearEnlace, [usuarioIDX, codigoGenerado, fechaCaducidadUTC]);
                // Contruimos el mensaje
                const origen = process.env.CORREO_DIRRECION_DE_ORIGEN;
                const destino = email;
                const asunto = "Recuperar tu VitiniID";
                const mensaje = `<html>Aquí tíenes el enlace para recuperar tu cuenta. Este enlace tiene una duración de 30 minutos. <a href="https://${hostActual}/micasa/recuperar_cuenta/${codigoGenerado}">Recuperar mi cuenta</a>
                    <br>
                    Casa Vitini
                    </html>`;
                const composicionDelMensaje = {
                    origen: origen,
                    destino: destino,
                    asunto: asunto,
                    mensaje: mensaje,
                };
                // Enviamos el mensaje
                const resultadoEnvio = enviarMail(composicionDelMensaje);
                const ok = {
                    ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para recuperar tu cuenta",
                };
                salida.json(ok);
            }
        } else {
            // Cuenta NO verificada, se busca verificar el correo
            const actualizarCodigoVerificacion = `
                UPDATE 
                usuarios
                SET
                "codigoVerificacion" = $1,
                "fechaCaducidadCuentaNoVerificada" = $2
                WHERE
                usuario = $3;
                `;
            const datosRestablecimiento = [
                codigoGenerado,
                fechaActualUTC,
                usuario
            ];
            await conexion.query(actualizarCodigoVerificacion, datosRestablecimiento);
            // Contruimos el mensaje
            const origen = process.env.CORREO_DIRRECION_DE_ORIGEN;
            const destino = email;
            const asunto = "Verifica tu mail";
            const mensaje = `<html>Aquí tíenes el enlace de verificación. Los enlaces de verificación tienen una validez de una hora desde que se generan.
                    <br>
                    <a href="https://casavitini.com/micasa/verificar_cuenta/${codigoGenerado}">Verificar mi mail</a>
                    <br>
                    Casa Vitini
                    </html>`;
            const composicionDelMensaje = {
                origen: origen,
                destino: destino,
                asunto: asunto,
                mensaje: mensaje,
            };
            // Enviamos el mensaje
            await conexion.query('COMMIT'); // Confirmar la transacción
            const resultadoEnvio = enviarMail(composicionDelMensaje);
            const ok = {
                ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para verificar tu VitiniID",
            };
            salida.json(ok);
        }


    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        console.info(errorCapturado.message);
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}