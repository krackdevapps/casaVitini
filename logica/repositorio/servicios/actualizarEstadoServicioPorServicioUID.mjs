import { conexion } from "../../componentes/db.mjs";
export const actualizarEstadoServicioPorServicioUID = async (data) => {
    try {

        const servicioUID = data.servicioUID
        const estadoIDV = data.estadoIDV

        const consulta = `
        UPDATE servicios
        SET "estadoIDV" = $2
        WHERE "servicioUID" = $1
        RETURNING "estadoIDV";
        `;
        const parametros = [
            servicioUID,
            estadoIDV,
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No existe el servicio, revisa el UID introducie en el campo servicioUID, recuerda que debe de ser un number";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
