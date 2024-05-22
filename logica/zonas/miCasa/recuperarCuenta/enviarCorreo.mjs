import { DateTime } from "luxon";
import { enviarMail } from "../../../sistema/Mail/enviarMail.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerEnlacesRecuperacionPorCodigoUPID } from "../../../repositorio/enlacesDeRecuperacion/obtenerEnlacesRecuperacionPorCodigoUPID.mjs";
import { obtenerDatosPersonalesPorMail } from "../../../repositorio/usuarios/obtenerDatosPersonalesPorMail.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";
import { eliminarEnlacesDeRecuperacion } from "../../../repositorio/enlacesDeRecuperacion/eliminarEnlacesDeRecuperacion.mjs";
import { insertarEnlaceDeRecuperacion } from "../../../repositorio/enlacesDeRecuperacion/insertarEnlaceDeRecuperacion.mjs";
import { actualizarEnlaceDeRecuperacionPorUsuario } from "../../../repositorio/enlacesDeRecuperacion/actualizarEnlaceDeRecuperacionPorUsuario.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

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
            const enlacesDeRecuperacion = await obtenerEnlacesRecuperacionPorCodigoUPID(codigoAleatorio)
            if (enlacesDeRecuperacion.length > 0) {
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
        await campoDeTransaccion("iniciar")
        const datosDelUsuario = obtenerDatosPersonalesPorMail(email)
        if (datosDelUsuario.email) {
            const error = "La dirección de correo electrònico no consta en nínguna cuenta de usuario. Registrate y crea tu VitiniID si lo neceistas.";
            throw new Error(error);
        }
        const usuarioIDX = datosDelUsuario.usuario;
        // Comporbar si es una recuperacion de contraseña o una verificacion de email
        const cuentaDeUsuario = obtenerUsuario(usuarioIDX)

        const estadoVerificacion = cuentaDeUsuario.cuentaVerificadaIDV;
        const usuario = cuentaDeUsuario.usuario;


        if (estadoVerificacion === "si") {
            // Cuenta verificada, se busca recuperar, es decir restablecer la clave

            await eliminarEnlacesDeRecuperacion()
            await insertarEnlaceDeRecuperacion({
                usuarioIDX: usuarioIDX,
                codigoGenerado: codigoGenerado,
                fechaCaducidadUTC: fechaCaducidadUTC
            })
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
            enviarMail(composicionDelMensaje);
            const ok = {
                ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para recuperar tu cuenta",
            };
            salida.json(ok)

        } else {
            // Cuenta NO verificada, se busca verificar el correo
            await actualizarEnlaceDeRecuperacionPorUsuario({
                codigoGenerado: codigoGenerado,
                fechaActualUTC: fechaActualUTC,
                usuario: usuario
            })
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
            await campoDeTransaccion("confirmar")
            enviarMail(composicionDelMensaje);
            const ok = {
                ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para verificar tu VitiniID",
            };
            return ok
        }


    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        console.info(errorCapturado.message);
        throw errorFinal
    }
}