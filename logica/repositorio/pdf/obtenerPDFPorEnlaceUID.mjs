import { conexion } from "../../componentes/db.mjs";

export const obtenerPDFPorEnlaceUID = async (enalceUID) => {
    try {

        const consulta = `
        SELECT
        uid,
        to_char(entrada, 'DD/MM/YYYY') as entrada, 
        to_char(salida, 'DD/MM/YYYY') as salida, 
        apartamento,
        "tipoBloqueo",
        motivo,
        zona
        FROM "bloqueosApartamentos"
        WHERE apartamento = $1 AND uid = $2;`;

        const resuelve = await conexion.query(consulta, enalceUID)
        if (resuelve.rowCount === 0) {
            const error = "No existe el enlace para generar el PDF";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}