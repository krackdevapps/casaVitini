import { conexion } from "../../componentes/db.mjs";
export const insertarComportamientoDePrecio = async (data) => {
    try {

        const nombreComportamiento = data.nombreComportamiento
        const fechaInicio_ISO = data.fechaInicio_ISO
        const fechaFinal_ISO = data.fechaFinal_ISO
        const tipo = data.tipo
        const diasArray = data.diasArray
        const estadoInicalDesactivado = "desactivado";

        const consulta = `
            INSERT INTO "comportamientoPrecios"
            (
                "nombreComportamiento",
                "fechaInicio",
                "fechaFinal",
                 estado,
                 tipo,
                 "diasArray"
            )
            VALUES
            (
                COALESCE($1, NULL),
                COALESCE($2::date, NULL),
                COALESCE($3::date, NULL),
                COALESCE($4, NULL),
                COALESCE($5, NULL),
                COALESCE($6::text[], NULL)
            )
            RETURNING uid;
            `;
        const parametros = [
            nombreComportamiento,
            fechaInicio_ISO,
            fechaFinal_ISO,
            estadoInicalDesactivado,
            tipo,
            diasArray
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
