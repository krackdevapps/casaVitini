import { conexion } from "../../../componentes/db.mjs"

export const actualizarContenidoMensajeDePortada = async (data) => {
    try {

        const mensajeUID = data.mensajeUID
        const mensajeB64 = data.mensajeB64

        const consulta =`
        UPDATE 
            "mensajesEnPortada"
        SET
            mensaje = $1
        WHERE
            uid = $2;`;

        const parametros = [
            mensajeB64,
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
