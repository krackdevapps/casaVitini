import { conexion } from "../globales/db.mjs";

export const actualizarCantidadPorElementoUID = async (data) => {
    try {
        const elementoUID = data.elementoUID
        const cantidad = data.cantidad

        const consulta = `
        UPDATE "inventarioGeneral"
        SET 
        "cantidad" = COALESCE($1, "cantidad")
        WHERE "UID" = $2
        RETURNING
        *
        `;
        const parametros = [
            cantidad,
            elementoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe se ha podido actualizar la cantidad del elemento, vuelvelo a intentar y revisa el elementoUID";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}