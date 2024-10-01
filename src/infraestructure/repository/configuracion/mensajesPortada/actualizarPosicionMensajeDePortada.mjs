import { conexion } from "../../globales/db.mjs"

export const actualizarPosicionDelMensajeDePortada = async (data) => {
    try {

        const mensajeUID = data.mensajeUID
        const posicion = data.posicion

        const consulta = `
        UPDATE 
            "mensajesEnPortada"
        SET
            posicion = $1
        WHERE
            "mensajeUID" = $2
        RETURNING *;`;

        const parametros = [
            posicion,
            mensajeUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún mensaje con ese UID para actualizarle la posición.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
