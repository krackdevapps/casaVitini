import { conexion } from "../../globales/db.mjs";

export const obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles = async () => {
    try {
        const estadoNoDisonible = "nodisponible";
        const consulta = `
        SELECT
        "apartamentoIDV"
        FROM "configuracionApartamento"
        WHERE "estadoConfiguracionIDV" = $1`;
        const resuelve = await conexion.query(consulta, [estadoNoDisonible]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}