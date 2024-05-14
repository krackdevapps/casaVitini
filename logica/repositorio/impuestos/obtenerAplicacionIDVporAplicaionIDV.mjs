import { conexion } from "../../componentes/db.mjs";

export const obtenerAplicacionIDVporAplicacionIDV = async (aplicacionIDV) => {
    try {
        const consulta = `
        SELECT 
        "aplicacionIDV"
        FROM "impuestosAplicacion"
        WHERE "aplicacionIDV" = $1
        `;
        const resuelve = await conexion.query(consulta, [aplicacionIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe el contexto de aplicación verifica el campor resuelveValidarAplicacionSobre";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}