import { eliminarSessionPorRolPorCaducidad } from "../../repositorio/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";


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
        throw errorCapturado
    }
}
