import { conexion } from "../db.mjs"




const obtenerDetallesOferta = async (ofertaUID) => {

    try {
        if (!ofertaUID || typeof ofertaUID !== "number" || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
            const error = "El campo 'ofertaUID' debe ser un tipo numero, entero y positivo"
            throw new Error(error)
        }
        const consultaDetallesOferta = `
        SELECT
        o.uid,
        to_char(o."fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char(o."fechaFin", 'DD/MM/YYYY') as "fechaFin", 
        o."numero",
        o."simboloNumero",
        o."descuentoAplicadoA" as "descuentoAplicadoAIDV",
        oa."aplicacionUI" as "descuentoAplicadoAUI",
        o."estadoOferta" as "estadoOfertaIDV",
        oe."estadoUI" as "estadoOfertaUI",
        o."tipoOferta" as "tipoOfertaIDV",
        ot."tipoOfertaUI" as "tipoOfertaUI",
        o."tipoDescuento" as "tipoDescuentoIDV",
        otd."tipoDescuentoUI" as "tipoDescuentoUI",
        o.cantidad AS "cantidad",
        o."nombreOferta"
        FROM
        ofertas o
        LEFT JOIN
        "ofertasAplicacion" oa ON o."descuentoAplicadoA" = oa."aplicacionIDV"
        LEFT JOIN
        "ofertasEstado" oe ON o."estadoOferta" = oe."estadoIDV"
        LEFT JOIN
        "ofertasTipo" ot ON o."tipoOferta" = ot."tipoOfertaIDV"
        LEFT JOIN
        "ofertasTipoDescuento" otd ON o."tipoDescuento" = otd."tipoDescuentoIDV"
        WHERE
        o.uid = $1;
        `
        const resuelveConsultaDetallesOferta = await conexion.query(consultaDetallesOferta, [ofertaUID])
        const oferta = resuelveConsultaDetallesOferta.rows[0]
        if (resuelveConsultaDetallesOferta.rowCount === 0) {
            const error = "No existe ninguna reserva con ese UID"
            throw new Error(error)
        }

        if (resuelveConsultaDetallesOferta.rowCount === 1) {
            if (oferta.tipoOfertaIDV === "porNumeroDeApartamentos" || oferta.tipoOfertaIDV === "porDiasDeAntelacion" || oferta.tipoOfertaIDV === "porDiasDeReserva" || oferta.tipoOfertaIDV === "porRangoDeFechas") {
                return oferta
            }

            if (oferta.tipoOfertaIDV === "porApartamentosEspecificos") {
                const detallesOferta = oferta
                detallesOferta["apartamentosDedicados"] = []
                const detallesApartamentosDedicados = `
                SELECT
                oa.apartamento AS "apartamentoIDV",
                a."apartamentoUI",
                oa."tipoDescuento",
                oa."cantidad"
                FROM 
                "ofertasApartamentos" oa
                LEFT JOIN
                "apartamentos" a ON oa.apartamento = a.apartamento
                WHERE oferta = $1
                `
                const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [oferta.uid])

                if (resuelveDetallesApartamentosDedicados.rowCount > 0) {

                    const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows
                    detallesOferta["apartamentosDedicados"] = []

                    apartamentosDedicados.map((apartamento) => {
                        const apartamentoIDV = apartamento.apartamentoIDV
                        const apartamentoUI = apartamento.apartamentoUI
                        const tipoDescuentoApartamento = apartamento.tipoDescuento
                        const cantidadApartamento = apartamento.cantidad
                        const detallesApartamentoDedicado = {
                            apartamentoIDV: apartamentoIDV,
                            apartamentoUI: apartamentoUI,
                            tipoDescuento: tipoDescuentoApartamento,
                            cantidadApartamento: cantidadApartamento

                        }
                        detallesOferta["apartamentosDedicados"].push(detallesApartamentoDedicado)
                    })
                }
                return detallesOferta
            }
        }

    } catch (errorCapturado) {
        throw errorCapturado
    }

}

export {
    obtenerDetallesOferta
}