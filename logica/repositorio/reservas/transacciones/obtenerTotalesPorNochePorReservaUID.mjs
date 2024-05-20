import { conexion } from "../../../componentes/db.mjs"

export const obtenerTotalesPorNochePorReservaUID = async (reservaUID) => {
    try {
        const consulta =`
        SELECT
        to_char("fechaDiaConNoche", 'YYYY-MM-DD') as "fechaDiaConNoche", 
        "precioNetoNoche",
        "apartamentos"
        FROM 
        "reservaTotalesPorNoche" 
        WHERE
        "reservaUID" = $1`
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

