import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

import { obtenerAdministradores } from "../../../infraestructure/repository/usuarios/obtenerAdministradores.mjs";
import { eliminarSessionUsuario } from "../../../infraestructure/repository/usuarios/eliminarSessionUsuario.mjs";
import { eliminarUsuario } from "../../../infraestructure/repository/usuarios/eliminarUsuario.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { controlRol } from "../../../shared/usuarios/controlRol.mjs";

export const eliminarCuentaDesdeAdministracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await controlRol({
            usuarioOperacion: IDX.vitiniIDX(),
            usuarioDestino: usuarioIDX
        })
        await campoDeTransaccion("iniciar")

        const rolIDV = IDX.rol()
        const rolAdministrador = "administrador";
        if (rolIDV === rolAdministrador) {
            const administradores = await obtenerAdministradores(rolAdministrador)
            if (administradores.length === 1) {
                const error = "No se puede eliminar esta cuenta porque es la única cuenta administrativa existente. Si quieres eliminar esta cuenta, tienes que crear otra cuenta administradora. En el sistema debe existir al menos una cuenta administrador.";
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
        throw errorCapturado
    }
}