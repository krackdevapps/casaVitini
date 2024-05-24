import { conexion } from "../../../componentes/db.mjs"

export const actualizarEstadoMensajeDePortada = async (data) => {
    try {

        const mensajeUID = data.mensajeUID
        const estado = data.estado

        const consulta = `
        UPDATE 
            "mensajesEnPortada"
        SET
            "estadoIDV" = $1
        WHERE
            "mensajeUID" = $2
        RETURNING
        *;`;

        const parametros = [
            estado,
            mensajeUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun mensaje con ese UID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
