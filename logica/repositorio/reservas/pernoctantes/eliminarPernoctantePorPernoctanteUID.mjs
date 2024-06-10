import { conexion } from "../../../componentes/db.mjs"

export const eliminarPernoctantePorPernoctanteUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const pernoctanteUID = data.pernoctanteUID

        const consulta = `
        DELETE FROM 
        "reservaPernoctantes"
        WHERE 
        "reservaUID" = $1 
        AND
        "componenteUID" = $2;
        `;
        const parametros = [
            reservaUID,
            pernoctanteUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se puede eliminar el pernoctante de la reserva por que no se encuenta.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

