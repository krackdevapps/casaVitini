import _ from "lodash";
import { conexion } from "../globales/db.mjs";

export const actualizarRangoFechasPorSimulacionUID = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const fechaCreacion = data.fechaCreacion
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const zonaIDV = data.zonaIDV
        const apartamentosIDVARRAY = JSON.stringify(data.apartamentosIDVARRAY)

        const consulta = `
        UPDATE
            "simulacionesDePrecio"
        SET 
            "fechaEntrada" = $1,
            "fechaSalida" = $2,
            "fechaCreacion" = $3,
            "apartamentosIDVARRAY" = $4,
            "zonaIDV" = $5
        WHERE 
            "simulacionUID" = $6
        RETURNING *;
           `;

        const parametros = [
            fechaEntrada,
            fechaSalida,
            fechaCreacion,
            apartamentosIDVARRAY,
            zonaIDV,
            simulacionUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar simulacionesDePrecio en la reserva.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

