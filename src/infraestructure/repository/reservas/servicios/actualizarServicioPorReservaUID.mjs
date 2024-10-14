import { conexion } from "../../globales/db.mjs"

export const actualizarServicioPorReservaUID = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const servicioUID_enReserva= data.servicioUID_enReserva
        const opcionesSel = data.opcionesSel

        const consulta = `
        UPDATE "reservaServicios"
        SET
        "opcionesSel" = $1
        WHERE
        "reservaUID" = $2
        AND
        "servicioUID" = $3
        RETURNING *;        `;
        const parametros = [
            opcionesSel,
            reservaUID,
            servicioUID_enReserva
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const m = "No se ha actualizar el servicio en la reserva."
            throw new Error(m)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

