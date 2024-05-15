import { conexion } from "../../../componentes/db.mjs"

export const actualizarFechaCheckinPernoctante = async (data) => {
    try {
        const fechaCheckIn_ISO = data.fechaCheckIn_ISO
        const pernoctanteUID = data.pernoctanteUID

        const consulta = `
        UPDATE "reservaPernoctantes"
        SET
          "fechaCheckIn" = $1
        WHERE
          "pernoctanteUID" = $2;
        `;
        const parametros = [
            fechaCheckIn_ISO,
            pernoctanteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el pernoctante para cambiarle la fecha de checkin";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

