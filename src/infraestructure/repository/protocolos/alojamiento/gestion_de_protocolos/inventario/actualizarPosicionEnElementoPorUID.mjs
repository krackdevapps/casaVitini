import { conexion } from "../../../../globales/db.mjs";

export const actualizarPosicionEnElementoPorUID = async (data) => {
    try {
        const uid = data.uid
        const posicion = data.posicion


        const consulta = `
        UPDATE  protocolos."inventarioAlojamiento"
        SET 
        "posicion" = $1
        WHERE uid = $2
        RETURNING
        *
        `;
        const parametros = [
            posicion,
            uid
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe el elemento revisa el UID del elemento.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}