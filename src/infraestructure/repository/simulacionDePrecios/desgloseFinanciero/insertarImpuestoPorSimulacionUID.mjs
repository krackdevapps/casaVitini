import { conexion } from "../../globales/db.mjs";

export const insertarImpuestoPorSimulacionUID = async (data) => {
    try {

        const simulacionUID = data.simulacionUID
        const impuesto = data.impuesto

        const consulta = `
        UPDATE 
        "simulacionesDePrecio"
        SET 
        "instantaneaImpuestos" = COALESCE(
            "instantaneaImpuestos", '[]'::jsonb
                ) || $2
        WHERE "simulacionUID" = $1;
        `
        const parametros = [
            simulacionUID,
            impuesto
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el impuesto en la reserva.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

