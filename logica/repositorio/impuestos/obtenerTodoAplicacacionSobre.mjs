import { conexion } from "../../componentes/db.mjs";

export const obtenerTodoAplicacacionSobre = async () => {
    try {
        const consulta = `
        SELECT 
        "aplicacionIDV", "aplicacionUI"
        FROM "impuestosAplicacion"
        `;
        const resuelve = await conexion.query(consulta);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}