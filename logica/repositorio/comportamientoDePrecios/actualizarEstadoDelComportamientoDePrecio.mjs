import { conexion } from "../../componentes/db.mjs";
export const actualizarEstadoDelComportamientoDePrecio = async (data) => {
    try {

        const estadoPropuesto = data.estadoPropuesto
        const comportamientoUID = data.comportamientoUID

        const consulta = `
        UPDATE "comportamientoPrecios"
        SET "estadoIDV" = $1
        WHERE "comportamientoUID" = $2
        RETURNING "estadoIDV";
        `;
        const parametros = [
            estadoPropuesto,
            comportamientoUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizado el estado del comportamiento de precio.";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
