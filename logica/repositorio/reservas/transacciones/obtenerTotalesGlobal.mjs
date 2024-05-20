import { conexion } from "../../../componentes/db.mjs"

export const obtenerTotalesGlobal = async (reservaUID) => {
    try {

        const consulta = `
        SELECT
            "totalConImpuestos"
        FROM 
            "reservaTotales"
        WHERE 
            reserva = $1;`;
        const resuelve = await conexion.query(consulta, [reservaUID]);
        return resuelve.rows
    } catch (error) {
        throw error
    }
}

