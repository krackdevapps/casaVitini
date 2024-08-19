import { conexion } from "../../componentes/db.mjs";
export const eliminarOfertaPorTestingVI = async (testingVI) => {
    try {
        const consulta =`
        DELETE FROM ofertas
        WHERE "testingVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [testingVI])
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
