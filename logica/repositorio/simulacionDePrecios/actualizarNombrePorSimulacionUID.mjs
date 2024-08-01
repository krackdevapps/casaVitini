import _ from "lodash";
import { conexion } from "../../componentes/db.mjs";

export const actualizarNombrePorSimulacionUID = async (data) => {
    try {
        const nombre = data.nombre
        const simulacionUID = data.simulacionUID
    
        const consulta = `
        UPDATE
            "simulacionesDePrecio"
        SET 
            nombre = $1
        WHERE 
            "simulacionUID" = $2
        RETURNING *;
           `;

        const parametros = [
            nombre,
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

