import { conexion } from "../../../../globales/db.mjs";

export const actualizarCantidadEnElemento = async (data) => {
    try {
        const uid = data.uid
        const cantidad_enAlojamiento = data.cantidad_enAlojamiento


        const consulta = `
        UPDATE  protocolos."inventarioAlojamiento"
        SET 
        "cantidad_enAlojamiento" = $1
        WHERE uid = $2
        RETURNING
        *
        `;
        const parametros = [
            cantidad_enAlojamiento,
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