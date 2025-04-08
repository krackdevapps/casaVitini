import { conexion } from "../globales/db.mjs";

export const obtenerOCrearVistaUIDPorVista = async (vista) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.vistas
        WHERE
        "vistaIDV" = $1;
        `;
        const vE = await conexion.query(consulta, [vista]);
        const vistaExistente = vE.rows[0]
        if (!vistaExistente) {
            const crearvista = `
                INSERT INTO
                permisos.vistas
                ("vistaIDV")
                VALUES 
                ($1)
                RETURNING 
                *
                `
            const vC = await conexion.query(crearvista, [vista]);
            const vistaCreada = vC.rows[0]
            return vistaCreada
        } else {
            return vistaExistente
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}