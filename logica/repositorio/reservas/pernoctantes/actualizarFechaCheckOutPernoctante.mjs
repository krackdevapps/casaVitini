import { conexion } from "../../../componentes/db.mjs"

export const actualizarFechaCheckOutPernoctante = async (data) => {
    try {
        const fechaCheckOut_ISO = data.fechaCheckOut_ISO
        const pernoctanteUID = data.pernoctanteUID

        const consulta = `
        UPDATE "reservaPernoctantes"
        SET
          "fechaCheckOutAdelantado" = $1
        WHERE
          "pernoctanteUID" = $2;
        `;
        const parametros = [
            fechaCheckOut_ISO,
            pernoctanteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el pernoctante para cambiarle la fecha de checkout";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

