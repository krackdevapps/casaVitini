import { conexion } from "../../globales/db.mjs"

export const eliminarReservaPorTestingVI = async (testingVI) => {
    try {
        const consulta = `
        DELETE FROM
        reservas
        WHERE 
        "testingVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

