import { conexion } from "../../../componentes/db.mjs"

export const insertarTotalPorNohce = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const apartamentosJSON = JSON.stringify(data.apartamentosJSON)
        const precioNetoNoche = data.precioNetoNoche
        const fechaDiaConNoche_ISO = data.fechaDiaConNoche_ISO

        const consulta = `
        INSERT INTO
        "reservaTotalesPorNoche"
        (
        reserva,
        "apartamentos",
        "precioNetoNoche",
        "fechaDiaConNoche"
        )
        VALUES ($1,$2::jsonb,$3,$4)
        RETURNING
        uid
        `
        const parametros = [
            reservaUID,
            apartamentosJSON,
            precioNetoNoche,
            fechaDiaConNoche_ISO
        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el total por noche.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}

