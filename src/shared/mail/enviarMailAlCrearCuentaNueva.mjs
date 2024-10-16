import { enviarMail } from "./enviarMail.mjs"
export const enviarMailAlCrearCuentaNueva = async (datosConfirmacion) => {
    try {
        const codigoVerificacion = datosConfirmacion.codigoVerificacion

        const origen = process.env.CORREO_DIRRECION_DE_ORIGEN
        const destino = datosConfirmacion.mail
        const asunto = "Verifica tu cuenta"
        const mensaje = `<html>
        Tu cuenta en Casa Vitini se ha creado. Necesitamos que verifiques tu correo. Por favor, pulsa en el enlace para verificar tu correo. Si no verificas tu cuenta de correo, no puedes acceder a la información de tu reserva y tu VitiniID será eliminado en media hora.
        <br>
        Recuerda que el código de verificación dura una hora desde su emisión. 
        <a href="https://casavitini.com/micasa/verificar_cuenta/${codigoVerificacion}">Verificar cuenta</a>
        <br>
        <br>
        Si no puedes acceder al enlace de abajo entra en https://casavitini.com/micasa/verificar_cuenta e inserta el código temporal de verificación de un solo uso: ${codigoVerificacion}
        <br>
        <br>
        Casa Vitini
        
        </html>`

        const composicionDelMensaje = {
            origen: origen,
            destino: destino,
            asunto: asunto,
            mensaje: mensaje,

        }
        const resultado = await enviarMail(composicionDelMensaje)
    } catch (errorCapturado) {
    }
}
