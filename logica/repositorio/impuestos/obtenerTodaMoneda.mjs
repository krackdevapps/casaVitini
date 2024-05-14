import { conexion } from "../../componentes/db.mjs";

export const obtenerTodaMoneda = async () => {
    try {
        const consulta = `
        SELECT 
        "monedaIDV", "monedaUI", simbolo
        FROM monedas
        `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}