import { conexion } from "../../componentes/db.mjs";

export const eliminarImpuesto = async (impuestoUID) => {
    try {
        const consulta = `
        DELETE FROM impuestos
        WHERE "impuestoUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [impuestoUID]);
        if (resuelve.rowCount === 0) {
            const error = "No existe el perfil del impuesto que deseas eliminar";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}