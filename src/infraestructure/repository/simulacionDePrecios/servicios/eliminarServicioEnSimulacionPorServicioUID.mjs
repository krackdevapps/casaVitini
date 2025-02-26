import { conexion } from "../../globales/db.mjs"

export const eliminarServicioEnSimulacionPorServicioUID = async (servicioUID_enSimulacion) => {
    try {
        const consulta = `
        DELETE FROM 
        "simulacionesDePrecioServicios"
        WHERE 
        "servicioUID" = $1;
        `;

        const resuelve = await conexion.query(consulta, [servicioUID_enSimulacion]);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

