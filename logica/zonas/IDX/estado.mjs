import { borrarCuentasCaducadas } from "../../sistema/VitiniIDX/borrarCuentasCaducadas.mjs";
import { eliminarCuentasNoVerificadas } from "../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";
import { obtenerUsuario } from "../../repositorio/usuarios/obtenerUsuario.mjs";

export const estado = async (entrada, salida) => {
    try {
        await eliminarCuentasNoVerificadas();
        await borrarCuentasCaducadas();

        const usuario = entrada.session?.usuario;
        const rol = entrada.session?.rol;
        const respuesta = {};
        if (usuario) {
            respuesta.estado = "conectado";
            respuesta.usuario = usuario;
            respuesta.rol = rol;
            respuesta.cuentaVerificada = "no";
            const cuentaUsuario = await obtenerUsuario(usuario)
            const estadoCuenta = cuentaUsuario.cuentaVerificadaIDX;
            if (estadoCuenta === "si") {
                respuesta.cuentaVerificada = "si";
            }
        } else {
            respuesta.estado = "desconectado";
        }
        salida.json(respuesta);

    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}
