import { componentes } from "../../componentes.mjs";

export const desconectar = async (entrada, salida) => {
    try {
        await componentes.eliminarCuentasNoVerificadas();
        await componentes.borrarCuentasCaducadas();
        entrada.session.destroy();
        salida.clearCookie("VitiniID");
        const respuesta = {
            IDX: "desconectado"
        };
        salida.json(respuesta);


    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}
