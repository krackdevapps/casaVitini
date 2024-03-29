import { detallesReserva } from "./detallesReserva.mjs"
import { enviarMail } from "./enviarMail.mjs"
import { generadorPDF3 } from "./generadorPDF.mjs"
import dotenv from "dotenv";
dotenv.config();
const enviarEmailReservaConfirmaada = async (reservaUID) => {
    try {
        const datosDetallesReserva = {
            reservaUID: reservaUID
        }
        const reserva = await detallesReserva(datosDetallesReserva)
        const nombreCompletoTitularReserva = reserva.reserva.titular.nombreTitular
        const emailDestinoTitular = reserva.reserva.titular.emailTitular
        const numeroReserva = reserva.reserva.reserva
        console.log("Numero de la reserva", numeroReserva)
        console.log("email destino", emailDestinoTitular)
        const hostActual = "localhost"
        // Contruimos el mensaje
        const origen = process.env.CORREO_DIRRECION_DE_ORIGEN
        const destino = emailDestinoTitular
        const asunto = "Reserva confirmada"
        const mensaje = `<html>
        Tu reserva esta confirmada a nombre de ${nombreCompletoTitularReserva}. Le enviamos un PDF adjunto al mensaje con el resumen de su reserva para su comomidad.
        El numero de su reserva es: ${numeroReserva}
        Cree su VitiniID para poder tener acceso persistente a la copia de su reserva.
        <a href="https://casavitini.com/micasa/reservas/${numeroReserva}">Ir a mi reserva (Necesita un VitiniID)</a>
        <a href="https://casavitini.com/micasa/crear_nueva_cuenta">Crear mi VitiniID (Es rapido y gratuito)</a>
        </html>`
        const pdf = await generadorPDF3(reserva)
        const composicionDelMensaje = {
            origen: origen,
            destino: destino,
            asunto: asunto,
            mensaje: mensaje,
            attachments: [
                {
                    filename: 'Reserva.pdf',
                    content: pdf,
                },
            ]
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
    enviarEmailReservaConfirmaada
}