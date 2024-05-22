import { conexion } from "../../componentes/db.mjs";
export const obtenerComportamientosDistintosPorTipoIDVPorDiasArray = async (data) => {
    try {
        const tipoIDV = data.tipoIDV
        const diasArray = data.diasArray
        const comportamientoUID = data.comportamientoUID

        const consulta = `
        SELECT *
        FROM 
        "comportamientoPrecios"
        WHERE 
        "tipoIDV" = $1
        AND
        $2::text[] && "diasArray";
        AND 
        "comportamientoUID" <> $3;
        `
        const parametros = [
            tipoIDV,
            diasArray,
            comportamientoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun comportamiento de precio con ese comportamientoUID, revisa el identificador";
            throw new Error(error)
        }
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
