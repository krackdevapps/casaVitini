import { conexion } from "../globales/db.mjs";

export const obtenerOCrearControladorUIDPorControlador = async (zona) => {
    try {
        const consulta = `
        SELECT 
        *
        FROM
        permisos.controladores
        WHERE
        "controladorIDV" = $1;
        `;
        const zE = await conexion.query(consulta, [zona]);
        const zonaExistente = zE.rows[0]
        if (!zonaExistente) {
            const crearZona = `
                INSERT INTO
                permisos.controladores
                ("controladorIDV")
                VALUES 
                ($1)
                RETURNING 
                *
                `
            const zC = await conexion.query(crearZona, [zona]);
            const zonaCreada = zC.rows[0]
            return zonaCreada
        } else {
            return zonaExistente
        }
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}