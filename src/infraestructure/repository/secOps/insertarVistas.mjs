import { conexion } from "../globales/db.mjs";

export const insertarVistas = async (data) => {
    try {
        const arrayVistas = data.arrayVistas
        const consulta = `
        INSERT INTO permisos.vistas ("vistaIDV")
        SELECT UNNEST($1::text[])
        ON CONFLICT ("vistaIDV") DO NOTHING
        RETURNING *;
        `;

        const nuevasVistas = await conexion.query(consulta, [arrayVistas]);
        return nuevasVistas.rows
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}