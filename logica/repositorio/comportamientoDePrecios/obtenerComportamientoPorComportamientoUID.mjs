import { conexion } from "../../componentes/db.mjs";
export const obtenerComportamientoDePrecioPorComportamientoUID = async (comportamientoUID) => {
    try {

        const consulta =  `
        SELECT
        *
        FROM
        "comportamientoPrecios" 
        WHERE
        "comportamientoUID" = $1;
        `;

        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún comportamiento de precio con ese comportamientoUID. Revisa el identificador.";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
