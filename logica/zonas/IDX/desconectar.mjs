import { eliminarSessionPorRolPorCaducidad } from "../../repositorio/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

export const desconectar = async (entrada, salida) => {
    try {
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await eliminarSessionPorRolPorCaducidad();
        entrada.session.destroy();
        salida.clearCookie("VitiniID");
        const respuesta = {
            IDX: "desconectado"
        };
        salida.json(respuesta);


    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}
