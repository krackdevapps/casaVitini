import { conexion } from "../../../componentes/db.mjs"

export const actualizarFechaCheckinPernoctante = async (data) => {
    try {
        const fechaCheckIn =  data.fechaCheckIn;
        const pernoctanteUID = data.pernoctanteUID

        const consulta = `
        UPDATE "reservaPernoctantes"
        SET
          "fechaCheckIn" = $1
        WHERE
          "componenteUID" = $2;
        `;
        const parametros = [
            fechaCheckIn,
            pernoctanteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el pernoctante para cambiarle la fecha de checkin";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

