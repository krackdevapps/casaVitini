import { conexion } from "../../componentes/db.mjs";

export const obtenerTodasLasConfiguracionDeLosApartamentosNODisponibles = async () => {
    try {
        const estadoDisonible = "noDisponible";
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