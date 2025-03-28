import { conexion } from "../../globales/db.mjs"

export const insertarServicioPorReservaUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const nombre = data.nombre
        const contenedor = data.contenedor
        const opcionesSel = data.opcionesSel
        const descuentoTotalServicio = data.descuentoTotalServicio
        const estadoPagoIDV = data.estadoPagoIDV

        const consulta = `
        INSERT INTO "reservaServicios"
        (
        "reservaUID",
        nombre,
        contenedor,
        "opcionesSel",
        "descuentoTotalServicio",
        "estadoPagoIDV"
        )
        VALUES (
        $1,
        $2,
        $3,
        $4::jsonb,
        $5::jsonb,
        $6
        )
        RETURNING *
        `;
        const parametros = [
            reservaUID,
            nombre,
            contenedor,
            opcionesSel,
            descuentoTotalServicio,
            estadoPagoIDV
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

