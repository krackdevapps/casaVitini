import { detallesReserva } from "../reservas/detallesReserva.mjs"
import { enviarMail } from "./enviarMail.mjs"
import { generadorPDF } from "../pdf/generadorPDF.mjs"
import dotenv from "dotenv";
import { obtenerParConfiguracion } from "../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";
dotenv.config();
export const enviarMailDeAvisoPorReservaPublica = async (reservaUID) => {
    try {
        const c = await obtenerParConfiguracion([
            "correoCopiaReservaPublica"
        ])
        const correoCopiaReservaPublica = !c.correoCopiaReservaPublica ? "" : c.correoCopiaReservaPublica
        if (!correoCopiaReservaPublica) {
            return
        }

        const reserva = await detallesReserva({
            reservaUID: reservaUID,
            capas: [
                "titular",
                "alojamiento",
                "pernoctantes",
                "desgloseFinanciero"
            ]
        })
        const global = reserva.global
        const nombreCompletoTitularReserva = reserva.titular.nombreTitular
        const emailDestinoTitular = reserva.titular.mailTitular
        const telefonoTitular = reserva.titular.telefonoTitular
        const hostActual = "localhost"

        const origen = process.env.CORREO_DIRRECION_DE_ORIGEN
        const destino = correoCopiaReservaPublica
        const asunto = `Aviso de solicitud de reserva: ${reservaUID}`
        const mensaje = `<html>
        Se ha realizado una solicitud de reserva desde la zona publica. A Continuacion se detallan los datos mas relevantes:
        <br>
        Reserva: ${reservaUID}
        Titular: ${nombreCompletoTitularReserva}
        Mail: ${emailDestinoTitular}
        Telefono: ${telefonoTitular}
        <br>
        <a href="https://casavitini.com/micasa/reservas/reserva:${reservaUID}">Ir a la reserva</a>
        <a href="https://casavitini.com/administracion/reservas/pendientes_de_revision">Ir a reservas pendientes de revisión</a>
        </html>`
        const pdf = await generadorPDF(reserva)
        const composicionDelMensaje = {
            origen: origen,
            destino: destino,
            asunto: asunto,
            mensaje: mensaje,







        }

        const resultado = await enviarMail(composicionDelMensaje)
        console.info("envio", resultado)
    } catch (errorCapturado) {
        console.info("error en el envio", errorCapturado)

    }
}
