import { conexion } from "../../globales/db.mjs"

export const eliminarApartamentoEnSimulacion = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        DELETE 
        FROM 
            "simulacionesDePrecioAlojamiento"
        WHERE 
            "apartamentoIDV" = $1 
        AND 
            "simulacionUID" = $2;
        `;
        const parametros = [
            apartamentoIDV,
            simulacionUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se existe el apartamento en la simulación."
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

