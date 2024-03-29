import { enviarMail } from "./enviarMail.mjs"
import { generadorPDF3 } from "./generadorPDF.mjs"
const enviarEmailAlCrearCuentaNueva = async (datosConfirmacion) => {
    try {
        const codigoVerificacion = datosConfirmacion.codigoVerificacion
        // Contruimos el mensaje
        const origen = process.env.CORREO_DIRRECION_DE_ORIGEN
        const destino = datosConfirmacion.email
        const asunto = "Confirma tu VitiniID"
        const mensaje = `<html>
        Tu cuenta en Casa Vitini se ha creado. Necesitamos que verifiques tu correo. Por favor pulsa en el enlace para verificar tu email. Si no verificas tu cuenta de correo no puedes acceder a la informacion de tu reserva y tu VitiniID sera eliminado en una hora.
        
        Si no puedes acceder al enlaces de abajo entra en https://casavitini.com/micasa/verificar_cuenta e inserta el codigo temporal de verificación de un solo uso: ${codigoVerificacion}
        Recuerda que el codigo de verificación dura una hora desde su emisión.
        <a href="https://casavitini.com/micasa/verificar_cuenta/${codigoVerificacion}">Verificar cuenta</a>
        </html>`
        // const pdf = await generadorPDF3()
        const composicionDelMensaje = {
            origen: origen,
            destino: destino,
            asunto: asunto,
            mensaje: mensaje,
            /* 
             attachments: [
                  {
                      filename: 'Reserva.pdf',
                      content: pdf,
                  },
              ]
              */
        }
        // Enviamos el mensaje
        const resultado = await enviarMail(composicionDelMensaje)
        console.log("envio", resultado)
    } catch (error) {
        console.log("enviarEmailError", error)
        // manejar error de manera local
    }
}
export {
    enviarEmailAlCrearCuentaNueva
}