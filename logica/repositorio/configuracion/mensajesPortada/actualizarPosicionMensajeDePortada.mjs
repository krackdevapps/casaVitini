import { conexion } from "../../../componentes/db.mjs"

export const actualizarPosicionDelMensajeDePortada = async (data) => {
    try {

        const mensajeUID = data.mensajeUID
        const posicion = data.posicion

        const consulta =`
        UPDATE 
            "mensajeEnPortada"
        SET
            posicion = $1
        WHERE
            uid = $2
        RETURNING *;`;

        const parametros = [
            posicion,
            mensajeUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun mensaje con ese UID para actualizarle la posicion";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
