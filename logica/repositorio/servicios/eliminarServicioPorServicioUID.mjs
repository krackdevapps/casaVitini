import { conexion } from "../../componentes/db.mjs";
export const eliminarServicioPorServicioUID = async (servicioUID) => {
    try {
        const consulta =`
        DELETE FROM servicios
        WHERE "servicioUID" = $1;
        `;
        const resuelve = await conexion.query(consulta, [servicioUID])
        if (resuelve.rowCount === 0) {
            const error = "No se encuentra el servicio que quieres eliminar, revisa el servicioUID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
