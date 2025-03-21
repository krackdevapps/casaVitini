import { detallesReserva } from "../reservas/detallesReserva.mjs"
import { enviarMail } from "./enviarMail.mjs"
import dotenv from "dotenv";
import { esquemaGlobal } from "../../application/administracion/reservas/detallesReserva/pdf/contenedores/esquemaGlobal.mjs";
dotenv.config();
export const enviarMailReservaConfirmadaAlCliente = async (reservaUID) => {
    try {
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
        const hostActual = "localhost"

        const origen = process.env.CORREO_DIRRECION_DE_ORIGEN
        const destino = emailDestinoTitular
        const asunto = "Reserva confirmada"
        const mensaje = `<html>
        Tu reserva está confirmada a nombre de ${nombreCompletoTitularReserva}. Le enviamos un PDF adjunto al mensaje con el resumen de su reserva para su comodidad.
        <br>
        El número de su reserva es: ${reservaUID}
        <br>
        Cree su VitiniID para poder tener acceso persistente a la copia de su reserva.
        <br>
        <a href="https://casavitini.com/micasa/reservas/reserva:${reservaUID}">Ir a mi reserva (Necesita un VitiniID)</a>
        <br>
        <a href="https://casavitini.com/micasa/crear_nueva_cuenta">Crear mi VitiniID (Es rápido y gratuito)</a>
        </html>`
        const pdf = await esquemaGlobal({
            incluirTitular: "si",
            reserva: resolverDetallesReserva,
            tablasIDV: [
                "fechas",
                "alojamiento",
                "servicios",
                "totalesGlobales"
            ]
        })


        const composicionDelMensaje = {
            origen: origen,
            destino: destino,
            asunto: asunto,
            mensaje: mensaje,
            attachments: [




                {
                    filename: 'Reserva.pdf',
                    content: pdf,
                    encoding: 'base64',
                },
            ]
        }

        const resultado = await enviarMail(composicionDelMensaje)
        console.info("envio", resultado)

    } catch (errorCapturado) {
        console.info("error en el envio", errorCapturado)

    }
}
