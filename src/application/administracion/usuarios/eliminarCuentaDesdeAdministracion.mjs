
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarSessionUsuario } from "../../../infraestructure/repository/usuarios/eliminarSessionUsuario.mjs";
import { eliminarUsuario } from "../../../infraestructure/repository/usuarios/eliminarUsuario.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { adminControlIntegrity } from "../../../shared/secOps/adminControlIntegrity.mjs";

export const eliminarCuentaDesdeAdministracion = async (entrada, salida) => {
    try {

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
        await campoDeTransaccion("iniciar")
        await adminControlIntegrity({
            usuario: usuarioIDX,
            contexto: "cuentas"
        })
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