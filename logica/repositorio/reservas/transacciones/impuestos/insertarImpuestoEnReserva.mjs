import { conexion } from "../../../../componentes/db.mjs";

export const insertarImpuestoEnReserva = async (data) => {
    try {

        const reservaUID = data.reservaUID
        const instantaneaImpuestos = data.instantaneaImpuestos


        const consulta =`
        INSERT INTO
        "reservaFinanciero"
        (
        "reservaUID",
        "nombreImpuesto",
        "tipoImpositivoIDV",
        "tipoValorIDV",
        "calculoImpuestoPorcentaje"
        )
        VALUES ($1,$2,$3,$4,$5)
        `
        const parametros = [
            reservaUID,
            impuestoNombre,
            tipoImpositivo,
            tipoValor,
            calculoImpuestoPorcentaje
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

