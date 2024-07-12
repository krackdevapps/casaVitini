import { conexion } from "../../../../componentes/db.mjs";

export const eliminarPagoPorPagoUID = async (data) => {
    try {

        const pagoUID = data.pagoUID
        const reservaUID = data.reservaUID
  
        const consulta = `
        DELETE FROM "reservaPagos"
        WHERE "pagoUID" = $1 AND "reservaUID" = $2;
        `;
        const parametros = [
            pagoUID,
            reservaUID
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe el pago que quieres eliminar";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

