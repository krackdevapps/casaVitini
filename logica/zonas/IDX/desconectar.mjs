import { borrarCuentasCaducadas } from "../../sistema/VitiniIDX/borrarCuentasCaducadas.mjs";
import { eliminarCuentasNoVerificadas } from "../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

export const desconectar = async (entrada, salida) => {
    try {
        await eliminarCuentasNoVerificadas();
        await borrarCuentasCaducadas();
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
