import { conexion } from "../../globales/db.mjs"

export const actualizarEstadoMensajeDePortada = async (data) => {
    try {

        const mensajeUID = data.mensajeUID
        const estadoIDV = data.estadoIDV

        const consulta = `
        UPDATE 
            "mensajesEnPortada"
        SET
            "estadoIDV" = $1::"tipo_estadosIDV"
        WHERE
            "mensajeUID" = $2
        RETURNING
        *;`;

        const parametros = [
            estadoIDV,
            mensajeUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún mensaje con ese UID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
