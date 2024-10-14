import { conexion } from "../../globales/db.mjs"

export const insertarComplementoAlojamientoPorReservaUID = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const complementoUI = data.complementoUI
        const apartamentoIDV = data.apartamentoIDV
        const definicion = data.definicion
        const tipoPrecio = data.tipoPrecio
        const precio = data.precio
        const apartamentoUID = data.apartamentoUID

        const consulta = `
        INSERT INTO "reservaComplementosAlojamiento"
        (
        "reservaUID",
        "complementoUI",
        "apartamentoIDV",
        "definicion",
        "tipoPrecio",
        "precio",
        "apartamentoUID"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `;
        const parametros = [
            reservaUID,
            complementoUI,
            apartamentoIDV,
            definicion,
            tipoPrecio,
            precio,
            apartamentoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const m = `No se ha insertado el complemento de alojamiento en la reserva ${reservaUID} para el apartmento ${apartamentoIDV}.`
            throw new Error(m)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

