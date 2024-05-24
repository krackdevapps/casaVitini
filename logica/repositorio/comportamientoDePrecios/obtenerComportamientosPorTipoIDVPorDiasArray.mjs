import { conexion } from "../../componentes/db.mjs";
export const obtenerComportamientosPorTipoIDVPorDiasArray = async (data) => {
    try {
        const tipoIDV = data.tipoIDV
        const diasArray = data.diasArray

        const consulta = `
        SELECT *
        FROM "comportamientoPrecios"
        WHERE 
        "tipoIDV" = $1
        AND
        $2::text[] && "diasArray";
        `
        const parametros = [
            tipoIDV,
            diasArray
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
