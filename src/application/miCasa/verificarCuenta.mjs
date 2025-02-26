import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { actualizarEstadoVerificacion } from "../../infraestructure/repository/usuarios/actualizarEstadoVerificacion.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { campoDeTransaccion } from "../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const verificarCuenta = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const codigo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.codigo,
            nombreCampo: "El tipo valor",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await campoDeTransaccion("iniciar")
        const estadoVerificado = "si";
        const usuarioVerificado = await actualizarEstadoVerificacion({
            estadoVerificado: estadoVerificado,
            codigo: codigo
        })
        await campoDeTransaccion("confirmar")

        const usuario = usuarioVerificado.usuario;
        const ok = {
            ok: "Cuenta verificada",
            usuario: usuario
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}