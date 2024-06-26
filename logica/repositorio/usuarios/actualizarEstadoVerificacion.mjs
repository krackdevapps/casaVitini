import { conexion } from "../../componentes/db.mjs";

export const actualizarEstadoVerificacion = async (data) => {
    const estadoVerificado = data.estadoVerificado
    const codigo = data.codigo
    try {
        const consulta = `
        UPDATE 
        usuarios
        SET
        "cuentaVerificada" = $1,
        "codigoVerificacion" = NULL,
        "fechaCaducidadCuentaNoVerificada" = NULL
        WHERE
        "codigoVerificacion" = $2
        RETURNING
        usuario
        `;
        const parametros = [
            estadoVerificado, 
            codigo
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "El codigo que has introducino no existe";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw error;
    }
};
