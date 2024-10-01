import { conexion } from "../../globales/db.mjs"

export const actualizaOrdenDePosiciones = async (posicion) => {
    try {
        const consulta = `
        UPDATE "mensajesEnPortada"
        SET posicion = posicion - 1
        WHERE posicion > $1; 
    `;

        const resuelve = await conexion.query(consulta, [posicion]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
