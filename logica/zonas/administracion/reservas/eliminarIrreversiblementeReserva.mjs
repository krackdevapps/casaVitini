import { Mutex } from "async-mutex";
import { vitiniCrypto } from "../../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarIrreversiblementeReserva = async (entrada, salida) => {
    const mutex = new Mutex()

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        await mutex.acquire();

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
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
        // Validar si es un usuario administrador
        const rol = usuario.rol;
        const rolAdministrador = "administrador";
        if (rol !== rolAdministrador) {
            const error = "Tu cuenta no esta autorizada para eliminar reservas. Puedes cancelar reservas pero no eliminarlas.";
            throw new Error(error);
        }
        await obtenerReservaPorReservaUID(reservaUID)
        await eliminarIrreversiblementeReserva(reservaUID)
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha eliminado la reserva y su informacion asociada de forma irreversible"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}