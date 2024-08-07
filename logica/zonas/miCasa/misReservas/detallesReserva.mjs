import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { detallesReserva as detallesReserva_ } from "../../../sistema/reservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerDatosPersonales } from "../../../repositorio/usuarios/obtenerDatosPersonales.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerTitularPoolReservaPorReservaUID } from "../../../repositorio/reservas/titulares/obtenerTitularPoolReservaPorReservaUID.mjs";
import { obtenerTitularReservaPorReservaUID } from "../../../repositorio/reservas/titulares/obtenerTitularReservaPorReservaUID.mjs";
import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";

export const detallesReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const usuario = entrada.session.usuario;
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const datosDelUsuario = await obtenerDatosPersonales(usuario)
        const usuarioMail = datosDelUsuario.mail;
        if (!usuarioMail) {
            const error = "Se necesita que definas tu dirección de correo elecroníco en Mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo eletroníco que usastes para confirmar la reserva. Es decir debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de Correo electrónico y confirmarlo con el correo de confirmacion que te enviaremos. Una vez hecho eso podras ver tus reservas";
            throw new Error(error);
        }
        // Comporbar si el mail esta verificado
        const cuentaUsuario = await obtenerUsuario({
            usuario,
            errorSi: "noExiste"
        })
        const estadoCuentaVerificada = cuentaUsuario.cuentaVerificadaIDV;
        if (estadoCuentaVerificada !== "si") {
            const error = "Tienes que verificar tu dirección de Correo electrónico para poder acceder a las reservas asociadas a tu direcíon de correo electroníco. Para ello pulsa en verificar tu correo electrónico.";
            throw new Error(error);
        }
        await obtenerReservaPorReservaUID(reservaUID)

        const titular = await obtenerTitularReservaPorReservaUID(reservaUID)
        const titularUID = titular?.titularUID
        const clienteUID = titular?.clienteUID
        if (titularUID) {
            const cliente = await obtenerDetallesCliente(clienteUID)
            const clienteMail = cliente.mail
            if (clienteMail !== usuarioMail) {
                const error = "No tienes acceso a esta reserva";
                throw new Error(error);
            }
        } else {
            const titularPool = await obtenerTitularPoolReservaPorReservaUID(reservaUID)
            const titularPoolMail = titularPool?.mailTitular
            if (titularPoolMail !== usuarioMail) {
                const error = "No tienes acceso a esta reserva";
                throw new Error(error);
            }
        }

        const resuelveDetallesReserva = await detallesReserva_({
            reservaUID,
            capas: [
                "titular",
                "alojamiento",
                "pernoctantes",
                "desgloseFinanciero",
                "detallesPagos"
            ]
        });
        delete resuelveDetallesReserva.global.origenIDV;
        const ok = {
            ok: "Aquí estan los detalles de su reserva",
            reserva: resuelveDetallesReserva
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}