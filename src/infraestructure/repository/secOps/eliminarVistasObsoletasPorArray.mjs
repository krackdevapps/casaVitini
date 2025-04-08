import { conexion } from "../globales/db.mjs";

export const eliminarVistasObsoletasPorArray = async (data) => {
    try {
        const rutasVistasObsoletas = data.rutasVistasObsoletas
        
        const consulta = `
        DELETE FROM
        permisos.vistas
        WHERE
        "vistaIDV" = ANY($1::text[]);
        `;;
        const v = await conexion.query(consulta, [rutasVistasObsoletas]);
        return v.rows[0]

    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}