import { detallesReserva } from "../reservas/detallesReserva.mjs"
import { enviarMail } from "./enviarMail.mjs"
import { generadorPDF } from "../PDF/generadorPDF.mjs"
import dotenv from "dotenv";
dotenv.config();
export const enviarEmailReservaConfirmada = async (reservaUID) => {
    try {
        const datosDetallesReserva = {
            reservaUID: reservaUID
        }
        const reserva = await detallesReserva(datosDetallesReserva)
        const nombreCompletoTitularReserva = reserva.reserva.titular.nombreTitular
        const emailDestinoTitular = reserva.reserva.titular.emailTitular
        const numeroReserva = reserva.reserva.reserva
        
        
        const hostActual = "localhost"
        // Contruimos el mensaje
        const origen = process.env.CORREO_DIRRECION_DE_ORIGEN
        const destino = emailDestinoTitular
        const asunto = "Reserva confirmada: " + numeroReserva
        const mensaje = `<html>
        Tu reserva esta confirmada a nombre de ${nombreCompletoTitularReserva}. Le enviamos un PDF adjunto al mensaje con el resumen de su reserva para su comomidad.
        <br>
        El numero de su reserva es: ${numeroReserva}
        <br>
        Cree su VitiniID para poder tener acceso persistente a la copia de su reserva.
        <br>
        <a href="https://casavitini.com/micasa/reservas/${numeroReserva}">Ir a mi reserva (Necesita un VitiniID)</a>
        <a href="https://casavitini.com/micasa/crear_nueva_cuenta">Crear mi VitiniID (Es rapido y gratuito)</a>
        </html>`
        const pdf = await generadorPDF(reserva)
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
        
    } catch (error) {
        
        // manejar error de manera local
    }
}
