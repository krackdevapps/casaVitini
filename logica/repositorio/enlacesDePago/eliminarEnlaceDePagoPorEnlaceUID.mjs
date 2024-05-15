import { conexion } from "../../../componentes/db.mjs"

export const eliminarEnlaceDePagoPorEnlaceUID = async (enlaceUID) => {
    try {
        const consulta = `
        DELETE FROM "enlacesDePago"
        WHERE "enlaceUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [enlaceUID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido eliminar el enlace de pago por que no existe";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

