import { conexion } from "../../componentes/db.mjs";
export const actualizarComportamientoDePrecio = async (data) => {
    try {
        const nombreComportamiento = data.nombreComportamiento
        const contenedor = data.contenedor
        const comportamientoUID = data.comportamientoUID

        const consulta = `
        UPDATE "comportamientoPrecios"
        SET 
        "nombreComportamiento" = $1,
        "contenedor" = $2
        WHERE 
        "comportamientoUID" = $3
        RETURNING *;
        `;
        const parametros = [
            nombreComportamiento,
            contenedor,
            comportamientoUID,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún comportamiento de precio con ese comportamientoUID. Revisa el identificador.";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
