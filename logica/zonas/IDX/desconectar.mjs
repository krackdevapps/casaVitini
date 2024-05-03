import { componentes } from "../../componentes.mjs";

export const desconectar = async (entrada, salida) => {
    try {
        const IDX = entrada.body.IDX
        if (!IDX) {
            const error = "Falta espeficiar la 'IDX', este puede ser conectar, desconectar y estado";
            throw new Error(error);
        }
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
