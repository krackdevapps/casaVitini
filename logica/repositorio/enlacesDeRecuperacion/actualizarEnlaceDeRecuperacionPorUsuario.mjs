import { conexion } from "../../componentes/db.mjs";

export const actualizarEnlaceDeRecuperacionPorUsuario = async (data) => {
    try {

        const usuario = data.usuario
        const codigoGenerado = data.codigoGenerado
        const fechaActualUTC = data.fechaActualUTC
        const consulta = `
        UPDATE 
        usuarios
        SET
        "codigoVerificacion" = $1,
        "fechaCaducidadCuentaNoVerificada" = $2
        WHERE
        usuario = $3
        RETURNING
        *;
        `;
        const parametros = [
            codigoGenerado,
            fechaActualUTC,
            usuario
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado el enlace de recuperacion"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

