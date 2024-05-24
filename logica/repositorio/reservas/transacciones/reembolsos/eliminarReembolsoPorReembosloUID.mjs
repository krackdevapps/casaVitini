import { conexion } from "../../../../componentes/db.mjs";

export const eliminarReembolsoPorReembosloUID = async (reembolsoUID) => {
    try {
        const consulta = `
        DELETE FROM "reservaReembolsos"
        WHERE "reembolsoUID" = $1;
        `;

        const resuelve = await conexion.query(consulta, [reembolsoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el reembolso con ese identificador, revisa el reembolsoUID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

