import { conexion } from "../../globales/db.mjs"

export const obtenerNumeroTotalReservas = async () => {
    try {
        const consulta = `       
        SELECT COUNT(*) AS "totalReservas"
        FROM reservas;
        `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows[0].totalReservas
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

