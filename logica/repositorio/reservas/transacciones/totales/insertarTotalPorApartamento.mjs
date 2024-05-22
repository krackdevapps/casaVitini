import { conexion } from "../../../componentes/db.mjs"

export const insertarTotalPorApartamento = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const apartamentoIDV = data.apartamentoIDV
        const apartamentoUI = data.apartamentoUI
        const totalNetoRango = data.totalNetoRango
        const precioMedioNocheRango = data.precioMedioNocheRango

        const consulta = `
        INSERT INTO
        "reservaTotalesPorApartamento"
        (
        reserva,
        "apartamentoIDV",
        "apartamentoUI",
        "totalNetoRango",
        "precioMedioNocheRango"
        )
        VALUES ($1,$2,$3,$4,$5)
        `
        const parametros = [
            reservaUID,
            apartamentoIDV,
            apartamentoUI,
            totalNetoRango,
            precioMedioNocheRango,
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el total por noche.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

