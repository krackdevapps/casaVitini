import { conexion } from "../globales/db.mjs";
export const insertarComportamientoDePrecio = async (data) => {
    try {
        const nombreComportamiento = data.nombreComportamiento
        const testing = data.testing
        const contenedor = data.contenedor
        const estadoInicial = data.estadoInicial || "desactivado";
        const consulta = `
            INSERT INTO "comportamientoPrecios"
            (
                "nombreComportamiento",
                "estadoIDV",
                 contenedor,
                "testingVI"
            )
            VALUES
            (
                COALESCE($1::text, NULL),
                COALESCE($2::text, NULL),
                COALESCE($3::jsonb, NULL),
                $4
            )
            RETURNING 
            *;
            `;
        const parametros = [
            nombreComportamiento,
            estadoInicial,
            contenedor,
            testing
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado el comportamiento de precio.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
