import { conexion } from "../../../componentes/db.mjs"

export const insertarTotalEnReserva = async (data) => {
    try {

        const promedioNetoPorNoche = data.promedioNetoPorNoche
        const totalReservaNetoSinOfertas = data.totalReservaNetoSinOfertas
        const totalReservaNeto = data.totalReservaNeto
        const totalDescuentos = data.totalDescuentos
        const totalImpuestos = data.totalImpuestos
        const totalConImpuestos = data.totalConImpuestos
        const reservaUID = data.reservaUID

        const consulta = `
        INSERT INTO
        "reservaTotales"
        (
        "promedioNetoPorNoche",
        "totalReservaNetoSinOfertas",
        "totalReservaNeto",
        "totalDescuentos",
        "totalImpuestos",
        "totalConImpuestos",
        reserva
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        `
        const parametros = [
            promedioNetoPorNoche,
            totalReservaNetoSinOfertas,
            totalReservaNeto,
            totalDescuentos,
            totalImpuestos,
            totalConImpuestos,
            reservaUID
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

