import { conexion } from "../../componentes/db.mjs";

export const obtenerTodasLasConfiguracionDeLosApartamentosSoloDisponibles = async () => {
    try {
        const estadoDisonible = "disponible";
        const consulta = `
        SELECT
        "apartamentoIDV"
        FROM "configuracionApartamento"
        WHERE "estadoConfiguracion" = $1`;
        const resuelve = await conexion.query(consulta, [estadoDisonible]);
        return resuelve.rows
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}