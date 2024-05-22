import { conexion } from "../../../componentes/db.mjs"

export const actualizarEstadoMensajeDePortada = async (data) => {
    try {

        const mensajeUID = data.mensajeUID
        const estado = data.estado

        const consulta = `
        UPDATE 
            "mensajesEnPortada"
        SET
            estado = $1
        WHERE
            uid = $2;`;

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
