import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerDatosPersonales } from "../../repositorio/usuarios/obtenerDatosPersonales.mjs";
import { obtenerUsuario } from "../../repositorio/usuarios/obtenerUsuario.mjs";
import { obtenerReservaPorReservaUID } from "../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerTitularPoolReservaPorReservaUID } from "../../repositorio/reservas/titulares/obtenerTitularPoolReservaPorReservaUID.mjs";
import { obtenerTitularReservaPorReservaUID } from "../../repositorio/reservas/titulares/obtenerTitularReservaPorReservaUID.mjs";
import { obtenerDetallesCliente } from "../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";

export const resolverQR = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.clientes()
        IDX.control()

        const usuario = entrada.session.usuario
        const rol = IDX.rol()
        const codigoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.codigoIDV,
            nombreCampo: "El campo codigoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const ok = {
            ok: "Aquí tiene la URL de tu código QR resuelta."
        }

        if (codigoIDV === "reserva") {
            const reservaUID = validadoresCompartidos.tipos.cadena({
                string: entrada.body.reservaUID,
                nombreCampo: "El identificador universal de la reserva (reservaUID)",
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                devuelveUnTipoNumber: "si"
            })
            await obtenerReservaPorReservaUID(reservaUID)


            if (rol === "administrador" || rol === "empleado") {
                ok.url = "/administracion/reservas/reserva:" + reservaUID
            } else if (rol === "cliente") {
                const datosDelUsuario = await obtenerDatosPersonales(usuario)
                const usuarioMail = datosDelUsuario.mail;
                if (!usuarioMail) {
                    const error = "Se necesita que definas tu dirección de correo electrónico en mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo electrónico que usaste para confirmar la reserva. Es decir, debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de correo electrónico y confirmarlo con el correo de confirmación que te enviaremos. Una vez hecho eso, podrás ver tus reservas.";
                    throw new Error(error);
                }


                // Comporbar si el mail esta verificado
                const cuentaUsuario = await obtenerUsuario({
                    usuario,
                    errorSi: "noExiste"
                })
                const estadoCuentaVerificada = cuentaUsuario.cuentaVerificadaIDV;
                if (estadoCuentaVerificada !== "si") {
                    const error = "Tienes que verificar tu dirección de correo electrónico para poder acceder a las reservas asociadas a tu dirección de correo electrónico. Para ello, pulsa en verificar tu correo electrónico.";
                    throw new Error(error);
                }


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
                ok.url = "/micasa/reservas/" + reservaUID


            }



        } else {
            const m = "No se reconoce el codigoIDV"
            throw new Error(m)
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}