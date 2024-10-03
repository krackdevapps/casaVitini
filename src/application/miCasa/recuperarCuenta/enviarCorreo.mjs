import { DateTime } from "luxon";
import { enviarMail } from "../../../shared/mail/enviarMail.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerEnlacesRecuperacionPorCodigoUPID } from "../../../infraestructure/repository/enlacesDeRecuperacion/obtenerEnlacesRecuperacionPorCodigoUPID.mjs";
import { obtenerDatosPersonalesPorMail } from "../../../infraestructure/repository/usuarios/obtenerDatosPersonalesPorMail.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { insertarEnlaceDeRecuperacion } from "../../../infraestructure/repository/enlacesDeRecuperacion/insertarEnlaceDeRecuperacion.mjs";
import { actualizarEnlaceDeRecuperacionPorUsuario } from "../../../infraestructure/repository/enlacesDeRecuperacion/actualizarEnlaceDeRecuperacionPorUsuario.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { eliminarEnlacesDeRecuperacionPorUsuario } from "../../../infraestructure/repository/enlacesDeRecuperacion/eliminarEnlacesDeRecuperacionPorUsuario.mjs";

export const enviarCorreo = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const mail = validadoresCompartidos.tipos.correoElectronico({
            mail: entrada.body.mail,
            nombreCampo: "El campo del mail de recuperación",
            sePermiteVacio: "no"
        })
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            validadoresCompartidos.tipos.cadena({
                string: testingVI,
                nombreCampo: "El campo testingVI",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
        }
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

            return codigoGenerado;
        };
        const codigoGenerado = await controlCodigo();
        const fechaActualUTC = DateTime.utc();
        const fechaCaducidadUTC = fechaActualUTC.plus({ hours: 1 });
        const hostActual = process.env.HOST_CASAVITINI;
        await campoDeTransaccion("iniciar")

        const datosDelUsuario = await obtenerDatosPersonalesPorMail(mail)
        if (!datosDelUsuario?.mail) {
            const error = "La dirección de correo electrónico no consta en ninguna cuenta de usuario. Regístrate y crea tu VitiniID si lo necesitas.";
            throw new Error(error);
        }

        const usuarioIDX = datosDelUsuario.usuario;

        const cuentaDeUsuario = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })

        const estadoVerificacion = cuentaDeUsuario.cuentaVerificadaIDV;
        const usuario = cuentaDeUsuario.usuario;


        if (estadoVerificacion === "si") {


            await eliminarEnlacesDeRecuperacionPorUsuario(usuarioIDX)
            await insertarEnlaceDeRecuperacion({
                usuarioIDX: usuarioIDX,
                codigoGenerado: codigoGenerado,
                fechaCaducidadUTC: fechaCaducidadUTC
            })

            const origen = process.env.CORREO_DIRRECION_DE_ORIGEN;
            const destino = mail;
            const asunto = "Recuperar tu VitiniID";
            const mensaje = `Aquí tienes el enlace para recuperar tu cuenta. Este enlace tiene una duración de 30 minutos. <a href="https://${hostActual}/micasa/recuperar_cuenta/${codigoGenerado}">Recuperar mi cuenta</a>
                    <br>
                    Casa Vitini
                    </html>`;
            const composicionDelMensaje = {
                origen: origen,
                destino: destino,
                asunto: asunto,
                mensaje: mensaje,
            };

            await campoDeTransaccion("confirmar")
            if (!testingVI) {
                enviarMail(composicionDelMensaje);
            }
            const ok = {
                ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para recuperar tu cuenta",
            };
            return ok

        } else {

            await actualizarEnlaceDeRecuperacionPorUsuario({
                codigoGenerado: codigoGenerado,
                fechaActualUTC: fechaActualUTC,
                usuario: usuario
            })

            const origen = process.env.CORREO_DIRRECION_DE_ORIGEN;
            const destino = mail;
            const asunto = "Verifica tu mail";
            const mensaje = `<html>Aquí tienes el enlace de verificación. El enlace tiene una validez de una hora desde que se genera.
                    <br>
                    <a href="https://casavitini.com/micasa/verificar_cuenta/${codigoGenerado}">Verificar mi correo.</a>
                    <br>
                    Casa Vitini
                    </html>`;
            const composicionDelMensaje = {
                origen: origen,
                destino: destino,
                asunto: asunto,
                mensaje: mensaje,
            };

            await campoDeTransaccion("confirmar")
            if (!testingVI) {
                enviarMail(composicionDelMensaje);
            }
            const ok = {
                ok: "Se ha enviado un mensaje a tu correo con un enlace temporal para verificar tu VitiniID",
            };
            return ok
        }


    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}