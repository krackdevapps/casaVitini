import { conexion } from "../../componentes/db.mjs";
export const insertarComportamientoDePrecio = async (data) => {
    try {
        const nombreComportamiento = data.nombreComportamiento
        const contenedor = data.contenedor
        const estadoInicalDesactivado = "desactivado";
        const consulta = `
            INSERT INTO "comportamientoPrecios"
            (
                "nombreComportamiento",
                "estadoIDV",
                 contenedor
            )
            VALUES
            (
                COALESCE($1::text, NULL),
                COALESCE($2::text, NULL),
                COALESCE($3::jsonb, NULL)
            )
            RETURNING 
            *;
            `;
        const parametros = [
            nombreComportamiento,
            estadoInicalDesactivado,
            contenedor
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado el comportamiento de precio";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
