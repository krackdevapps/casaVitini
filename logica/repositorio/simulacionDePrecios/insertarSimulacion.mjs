import _ from "lodash";
import { conexion } from "../../componentes/db.mjs";

export const insertarSimulacion = async (data) => {
    try {
        const nombre = data.nombre
        const reservaUID = data.reservaUID
        const fechaCreacion = data.fechaCreacion
        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const apartamentosIDVARRAY = JSON.stringify(data.apartamentosIDVARRAY)

        const desgloseFinanciero = data.desgloseFinanciero
        const instantaneaNoches = _.cloneDeep(desgloseFinanciero.entidades.reserva.instantaneaNoches);
        delete desgloseFinanciero.entidades.reserva.instantaneaNoches

        const instantaneaImpuestos = JSON.stringify(_.cloneDeep(desgloseFinanciero.entidades.reserva.instantaneaImpuestos));
        delete desgloseFinanciero.entidades.reserva.instantaneaImpuestos

        const instantaneaOfertasPorCondicion = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porCondicion)
        const instantaneaOfertasPorAdministrador = JSON.stringify(desgloseFinanciero.contenedorOfertas.entidades.reserva.ofertas.porAdministrador)

        const testingVI = data.testingVI

        const consulta = `
        INSERT INTO
        "simulacionesDePrecio"
        (
        "desgloseFinanciero",
        "instantaneaNoches",
        "instantaneaOfertasPorCondicion",
        "instantaneaOfertasPorAdministrador",
        "instantaneaImpuestos",
        "nombre",
        "fechaCreacion",
        "fechaEntrada",
        "fechaSalida",
        "apartamentosIDVARRAY",
        "reservaUID",
        "testingVI"
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *
        `
        const parametros = [
            desgloseFinanciero,
            instantaneaNoches,
            instantaneaOfertasPorCondicion,
            instantaneaOfertasPorAdministrador,
            instantaneaImpuestos,
            nombre,
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentosIDVARRAY,
            reservaUID,
            testingVI
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar simulacionesDePrecio en la reserva.";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

