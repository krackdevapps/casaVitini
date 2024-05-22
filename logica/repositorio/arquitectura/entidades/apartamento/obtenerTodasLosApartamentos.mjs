import { conexion } from "../../../../componentes/db.mjs"
export const obtenerTodasLosApartamentos = async () => {
    try {
        const consulta =`
        SELECT
        *
        FROM apartamentos;`;
        const resolucionNombre = await conexion.query(consulta)
        return resolucionNombre.rows
    } catch (errorCapturado) {
        throw error;
    }
}
