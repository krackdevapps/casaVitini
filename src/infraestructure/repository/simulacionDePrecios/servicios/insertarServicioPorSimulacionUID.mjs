import { conexion } from "../../globales/db.mjs"

export const insertarServicioPorSimulacionUID = async (data) => {
    try {
        const simulacionUID = data.simulacionUID
        const nombre = data.nombre
        const contenedor = data.contenedor
        const opcionesSel = data.opcionesSel
        const descuentoTotalServicio = data.descuentoTotalServicio

        const consulta = `
        INSERT INTO "simulacionesDePrecioServicios"
        (
        "simulacionUID",
        "nombre",
        "contenedor",
        "opcionesSel",
        "descuentoTotalServicio"
        )
        VALUES (
        $1,
        $2,
        $3,
        $4::jsonb,
        $5::jsonb
        )
        RETURNING *
        `;
        const parametros = [
            simulacionUID,
            nombre,
            contenedor,
            opcionesSel,
            descuentoTotalServicio
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const m = "No se ha insertado el servicio en la reserva."
            throw new Error(m)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

