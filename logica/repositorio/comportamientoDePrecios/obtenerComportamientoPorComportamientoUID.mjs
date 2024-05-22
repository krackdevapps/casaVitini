import { conexion } from "../../componentes/db.mjs";
export const obtenerComportamientoDePrecioPorComportamientoUID = async (comportamientoUID) => {
    try {

        const consulta =  `
        SELECT
        "comportamientoUID",
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal", 
        "nombreComportamiento",
        "estadoIDV",
        "tipoIDV",
        "diasArray"
        FROM
        "comportamientoPrecios" 
        WHERE
        "comportamientoUID" = $1;
        `;

        const resuelve = await conexion.query(consulta, [comportamientoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun comportamiento de precio con ese comportamientoUID, revisa el identificador";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
