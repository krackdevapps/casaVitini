import { conexion } from "../globales/db.mjs";

export const insertarControladores = async (data) => {
    try {
        const arrayControladores = data.arrayControladores
        const consulta = `
        INSERT INTO
        permisos.controladores
        ("controladorIDV")
        SELECT
        UNNEST($1::text[])
        ON CONFLICT ("controladorIDV") DO NOTHING
        RETURNING *;
          `;
        const controladores = await conexion.query(consulta, [arrayControladores]);
        return controladores.rows
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}