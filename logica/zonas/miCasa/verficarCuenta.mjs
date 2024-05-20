import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";
import { actualizarEstadoVerificacion } from "../../repositorio/usuarios/actualizarEstadoVerificacion.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";

export const verificarCuenta = async (entrada, salida) => {
    try {
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
        salida.json(ok);
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        console.info(errorCapturado.message);
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}