import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

import { obtenerAdministradores } from "../../../repositorio/usuarios/obtenerAdministradores.mjs";
import { eliminarSessionUsuario } from "../../../repositorio/usuarios/eliminarSessionUsuario.mjs";
import { eliminarUsuario } from "../../../repositorio/usuarios/eliminarUsuario.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const eliminarCuentaDesdeAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await campoDeTransaccion("iniciar")
        // Validar si es un usuario administrador
        const rolIDV = IDX.rol()
        const rolAdministrador = "administrador";
        if (rolIDV === rolAdministrador) {
            const administradores = await obtenerAdministradores(rolAdministrador)
            if (administradores.length === 1) {
                const error = "No se puede eliminar esta cuenta por que es la unica cuenta adminsitradora existente. Si quieres eliminar esta cuenta tienes que crear otra cuenta administradora. Por que en el sistema debe de existir al menos una cuenta adminitrador";
                throw new Error(error);
            }
        }
        await eliminarSessionUsuario(usuarioIDX)
        await eliminarUsuario(usuarioIDX)
        await campoDeTransaccion("confirmar");
        const ok = {
            ok: "Se ha eliminado correctamente la cuenta de usuario",
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorFinal
    }
}