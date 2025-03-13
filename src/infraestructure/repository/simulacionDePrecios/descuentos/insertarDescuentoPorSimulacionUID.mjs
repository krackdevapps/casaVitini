import { conexion } from "../../globales/db.mjs";

export const insertarDescuentoPorSimulacionUID = async (data) => {
    try {

        const simulacionUID = data.simulacionUID
        const descuentoDedicado = data.descuentoDedicado

        const consulta = `
        UPDATE 
        "simulacionesDePrecio"
        SET 
        "instantaneaOfertasPorAdministrador" = COALESCE(
            "instantaneaOfertasPorAdministrador", '[]'::jsonb
                ) || $2
        WHERE "simulacionUID" = $1;
        `
        const parametros = [
            simulacionUID,
            descuentoDedicado
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el descuento en la simulacion.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

