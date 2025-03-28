import { conexion } from "../globales/db.mjs";

export const insertarRegistro = async (data) => {
    try {
        const elementoUID = data.elementoUID
        const cantidadEnMovimiento = data.cantidadEnMovimiento
        const fecha = data.fecha
        const operacionIDV = data.operacionIDV
        const sentidoMovimiento = data.sentidoMovimiento
        const revisionUID = data?.revisionUID
        const reservaUID = data?.reservaUID
        const servicioUID_enReserva = data?.servicioUID_enReserva



        const consulta = `
        INSERT INTO "inventarioGeneralRegistro"
        (
        "elementoUID",
        "cantidadEnMovimiento",
        fecha,
        "operacionIDV",
        "sentidoMovimiento",
        "revisionUID",
        "reservaUID",
        "servicioUID_enReserva"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `;
        const parametros = [
            elementoUID,
            cantidadEnMovimiento,
            fecha,
            operacionIDV,
            sentidoMovimiento,
            revisionUID,
            reservaUID,
            servicioUID_enReserva
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado el registro en el inventario."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}