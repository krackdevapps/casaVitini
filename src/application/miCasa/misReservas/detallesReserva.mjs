import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { detallesReserva as detallesReserva_ } from "../../../shared/reservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerDatosPersonales } from "../../../infraestructure/repository/usuarios/obtenerDatosPersonales.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerTitularPoolReservaPorReservaUID } from "../../../infraestructure/repository/reservas/titulares/obtenerTitularPoolReservaPorReservaUID.mjs";
import { obtenerTitularReservaPorReservaUID } from "../../../infraestructure/repository/reservas/titulares/obtenerTitularReservaPorReservaUID.mjs";
import { obtenerDetallesCliente } from "../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";
import { limpiarContenedorFinacieroInformacionPrivada } from "../../../shared/miCasa/misReservas/limpiarContenedorFinancieroInformacionPrivada.mjs";

export const detallesReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.control()

        const usuario = entrada.session.usuario;

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const datosDelUsuario = await obtenerDatosPersonales(usuario)
        const usuarioMail = datosDelUsuario.mail;
        if (!usuarioMail) {
            const error = "Se necesita que definas tu dirección de correo electrónico en mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo electrónico que usaste para confirmar la reserva. Es decir, debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de correo electrónico y confirmarlo con el correo de confirmación que te enviaremos. Una vez hecho eso, podrás ver tus reservas.";
            throw new Error(error);
        }

        const cuentaUsuario = await obtenerUsuario({
            usuario,
            errorSi: "noExiste"
        })
        const estadoCuentaVerificada = cuentaUsuario.cuentaVerificadaIDV;
        if (estadoCuentaVerificada !== "si") {
            const error = "Tienes que verificar tu dirección de correo electrónico para poder acceder a las reservas asociadas a tu dirección de correo electrónico. Para ello, pulsa en verificar tu correo electrónico.";
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
                "complementosDeAlojamiento",
                "pernoctantes",
                "desgloseFinanciero",
                "detallesPagos",
                "servicios"
            ]
        });

        limpiarContenedorFinacieroInformacionPrivada(resuelveDetallesReserva)


        const ok = {
            ok: resuelveDetallesReserva
        }
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}