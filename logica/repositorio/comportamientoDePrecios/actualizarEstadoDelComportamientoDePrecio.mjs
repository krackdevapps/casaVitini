import { conexion } from "../../componentes/db.mjs";
export const actualizarEstadoDelComportamientoDePrecio = async (data) => {
    try {

        const estadoPropuesto = data.estadoPropuesto
        const comportamientoUID = data.comportamientoUID

        const consulta = `
        UPDATE "comportamientoPrecios"
        SET estado = $1
        WHERE uid = $2
        RETURNING estado;
        `;
        const parametros = [
            estadoPropuesto,
            comportamientoUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha actualizar el estado del comportamiento de precio";
            throw new Error(error)
        }
        const comportamientoActualizado = resuelve.rows[0]
        return comportamientoActualizado

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
