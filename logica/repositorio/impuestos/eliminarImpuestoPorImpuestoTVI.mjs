import { conexion } from "../../componentes/db.mjs";

export const eliminarImpuestoPorImpuestoTVI = async (impuestoTVI) => {
    try {
        const consulta = `
        DELETE FROM impuestos
        WHERE "impuestoTVI" = $1;
        `;
        const resuelve = await conexion.query(consulta, [impuestoTVI]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }

}