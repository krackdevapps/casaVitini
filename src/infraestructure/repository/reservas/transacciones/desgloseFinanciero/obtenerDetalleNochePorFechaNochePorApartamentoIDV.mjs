import { conexion } from "../../../globales/db.mjs";

export const obtenerDetalleNochePorFechaNochePorApartamentoIDV = async (data) => {
    try {
        const reservaUID = data.reservaUID
        const fechaNoche = data.fechaNoche
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
              SELECT
                fechas.key AS fecha,
                apartamento->>'apartamentoUI' AS "apartamentoUI",
                apartamento->>'precioNetoApartamento' AS "precioNetoApartamento"
              FROM
                "reservaFinanciero",
                jsonb_each("instantaneaNoches") AS fechas(key, nocheSeleccionada),
                jsonb_each(nocheSeleccionada->'apartamentosPorNoche') AS apartamentos(apartamento_id, apartamento)
              WHERE
                "apartamento_id" = $3
                AND
                "reservaUID" = $1
                AND
                fechas.key = $2;
            `;

        const parametros = [
            reservaUID,
            fechaNoche,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe la instantánea de la noche."
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}

