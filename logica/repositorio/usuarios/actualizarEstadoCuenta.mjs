import { conexion } from "../../componentes/db.mjs";

export const actualizarEstadoCuenta = async (data) => {

    const usuario = data.usuario
    const estadoCuentaIDV = data.estadoCuentaIDV


    try {
        const consulta = `
        UPDATE usuarios
        SET 
            "estadoCuentaIDV" = $1
        WHERE 
            usuario = $2
        `;
        const parametros = [
            estadoCuentaIDV,
            usuario
        ]
        const resuelve = await conexion.query(
            consulta,
            parametros
        )
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el usuario.";
            throw new Error(error);
        }
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
