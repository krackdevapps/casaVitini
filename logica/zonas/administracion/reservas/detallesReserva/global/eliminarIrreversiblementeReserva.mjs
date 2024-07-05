import { Mutex } from "async-mutex";
import { vitiniCrypto } from "../../../../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerUsuario } from "../../../../../repositorio/usuarios/obtenerUsuario.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";
import { eliminarReservaIrreversiblementePorReservaUID } from "../../../../../repositorio/reservas/reserva/eliminarReservaIrreversiblementePorReservaUID.mjs";

export const eliminarIrreversiblementeReserva = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const clave = entrada.body.clave;
        if (!clave) {
            const error = "No has enviado la clave de tu usuario para confirmar la operacion";
            throw new Error(error);
        }
        const usuarioIDX = entrada.session.usuario;
        await campoDeTransaccion("iniciar")
        const usuario = await obtenerUsuario(usuarioIDX)

        const claveActualHASH = usuario.clave;
        const sal = usuario.sal;
        const metadatos = {
            sentido: "comparar",
            clavePlana: clave,
            sal: sal,
            claveHash: claveActualHASH
        };
        const controlClave = vitiniCrypto(metadatos);
        if (!controlClave) {
            const error = "Revisa la contrasena actual que has escrito por que no es correcta por lo tanto no se puede eliminar tu cuenta";
            throw new Error(error);
        }
        const rol = usuario.rolIDV;
        const rolAdministrador = "administrador";
        if (rol !== rolAdministrador) {
            const error = "Tu cuenta no esta autorizada para eliminar reservas. Puedes cancelar reservas pero no eliminarlas.";
            throw new Error(error);
        }
        await obtenerReservaPorReservaUID(reservaUID)
        await eliminarReservaIrreversiblementePorReservaUID(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la reserva y su informacion asociada de forma irreversible"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}