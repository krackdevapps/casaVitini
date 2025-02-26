import nodemailer from 'nodemailer'

import dotenv from "dotenv";
dotenv.config();

export const enviarMail = async (entrada) => {
    try {
        const filtroCorreo = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
        const filtroComillas = /['"]/;

        const destino = entrada.destino;
        const origen = entrada.origen;
        const asunto = entrada.asunto;
        const mensaje = entrada.mensaje;

        if (!filtroCorreo.test(destino)) {
            const error = "La dirección de destino no tiene un formato correcto."
            throw new Error(error)
        }






        const transporte = nodemailer.createTransport({
            host: process.env.CORREO_HOST_SERVIDOR_CORREO,
            port: process.env.CORREO_PUERTO_SMTP,
            secure: false,
            auth: {
                user: process.env.CORREO_USUARIO_SMTP,
                pass: process.env.CORREO_PASS_SMTP,
            },
            tls: {
                rejectUnauthorized: true,
            },
        })
        const composicionDelMensaje = {
            from: origen,
            to: destino,
            subject: asunto,
            html: mensaje,
        }
        if (entrada.attachments) {
            composicionDelMensaje.attachments = entrada.attachments
        }

        const mensajeCompositor = await transporte.sendMail(composicionDelMensaje)
        return mensajeCompositor
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
