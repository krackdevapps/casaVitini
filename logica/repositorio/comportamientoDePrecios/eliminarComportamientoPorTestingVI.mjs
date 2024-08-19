import { conexion } from "../../componentes/db.mjs";
export const eliminarComportamientoPorTestingVI = async (testingVI) => {
    try {

        const consulta = `
        DELETE FROM "comportamientoPrecios"
        WHERE "testingVI" = $1;
        `;
   
        const resuelve = await conexion.query(consulta, [testingVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
