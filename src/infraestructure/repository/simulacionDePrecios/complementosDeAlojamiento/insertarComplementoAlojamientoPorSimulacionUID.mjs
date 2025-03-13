import { conexion } from "../../globales/db.mjs"

export const insertarComplementoAlojamientoPorSimulacionUID = async (data) => {
    try {

        const simulacionUID = data.simulacionUID
        const complementoUI = data.complementoUI
        const apartamentoIDV = data.apartamentoIDV
        const definicion = data.definicion
        const tipoPrecio = data.tipoPrecio
        const precio = data.precio
        const apartamentoUID = data.apartamentoUID
        const tipoUbicacion = data.tipoUbicacion
        const habitacionIDV = data.habitacionIDV
        const habitacionUI = data.habitacionUI

        const consulta = `
        INSERT INTO "simulacionesDePrecioComplementosAlojamiento"
        (
        "simulacionUID",
        "complementoUI",
        "apartamentoIDV",
        "definicion",
        "tipoPrecio",
        "precio",
        "apartamentoUID",
        "tipoUbicacion",
        "habitacionIDV",
        "habitacionUI"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
        `;
        const parametros = [
            simulacionUID,
            complementoUI,
            apartamentoIDV,
            definicion,
            tipoPrecio,
            precio,
            apartamentoUID,
            tipoUbicacion,
            habitacionIDV,
            habitacionUI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const m = `No se ha insertado el complemento de alojamiento en la simulacion ${simulacionUID} para el apartmento ${apartamentoIDV}.`
            throw new Error(m)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

