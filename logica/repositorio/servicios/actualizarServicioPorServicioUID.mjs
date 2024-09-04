import { conexion } from "../../componentes/db.mjs";
export const actualizarServicioPorServicioUID = async (data) => {
    try {
        const nombreServicio = data.nombreServicio
        const zonaIDV = data.zonaIDV
        const contenedor = data.contenedor
        const servicioUID = data.servicioUID


        const consulta = `
        UPDATE servicios
        SET
        nombre = $1,
        "zonaIDV" = $2::text,
        contenedor = $3::jsonb
        WHERE
        "servicioUID" = $4
        RETURNING
        *`;
        const parametros = [
            nombreServicio,
            zonaIDV,
            contenedor,
            servicioUID
        ]

        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido actualizar el servicio.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
