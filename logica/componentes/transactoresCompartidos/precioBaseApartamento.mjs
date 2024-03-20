import Decimal from 'decimal.js';
import { conexion } from '../db.mjs';
import { resolverApartamentoUI } from './resolverApartamentoUI.mjs'

// Los precios de los apartamentos, van asociados a fechas
const precioBaseApartamento = async (apartamentoIDV) => {
    try {
        const filtroCadena = /^[a-z0-9]+$/;

        if (typeof apartamentoIDV !== "string" || !filtroCadena.test(apartamentoIDV)) {
            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios"
            throw new Error(error)
        }


        const validarApartamento = `
        SELECT
        "apartamentoIDV"
        FROM 
        "configuracionApartamento"
        WHERE "apartamentoIDV" = $1
        `
        const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV])
        if (resuelveValidarApartamento.rowCount === 0) {
            const error = "No existe el apartamento"
            throw new Error(error)
        }
        const detallesApartamento = {}
        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV)

        detallesApartamento.apartamentoUI = apartamentoUI
        detallesApartamento.apartamentoIDV = apartamentoIDV

        const listarPrecioApartamento = `
        SELECT
        uid, apartamento, precio, moneda
        FROM 
        "preciosApartamentos"
        WHERE apartamento = $1
        `
        const resuelveListarPrecioApartamento = await conexion.query(listarPrecioApartamento, [apartamentoIDV])
        let precioNetoApartamentoPorDia
        if (resuelveListarPrecioApartamento.rowCount === 0) {
            // OJO QUE ESTO ESTA A MEDIAS!!!!!!!!!
            const precioInicial = "00.00"
            const moneda = "usd"
            const insertarNuevoPerfilPrecio = `
            INSERT INTO "preciosApartamentos"
            (apartamento, precio, moneda)
            VALUES ($1, $2, $3) RETURNING uid, apartamento, precio
            `
            const resuelveInsertaNuevoPerfilPrecio = await conexion.query(insertarNuevoPerfilPrecio, [apartamentoIDV, precioInicial, moneda])
            precioNetoApartamentoPorDia = resuelveInsertaNuevoPerfilPrecio.rows[0].precio

        } else {
            precioNetoApartamentoPorDia = resuelveListarPrecioApartamento.rows[0].precio
        }
        detallesApartamento.precioNetoPorDia = precioNetoApartamentoPorDia

        const seleccionarImpuestos = `
        SELECT
        nombre, "tipoImpositivo", "tipoValor"
        FROM
        impuestos
        WHERE
        ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;
      
        `
        const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto", "activado"])
        if (resuelveSeleccionarImpuestos.rowCount > 0) {
            detallesApartamento.impuestos = []
            const impuestosEncontrados = resuelveSeleccionarImpuestos.rows
            let impuestosFinal

            let sumaTotalImpuestos = "0.00"
            impuestosEncontrados.map((detalleImpuesto) => {
                const tipoImpositivo = new Decimal(detalleImpuesto.tipoImpositivo)

                const nombreImpuesto = detalleImpuesto.nombre 
                const tipoValor = detalleImpuesto.tipoValor
                impuestosFinal = {
                    nombreImpuesto: nombreImpuesto,
                    tipoImpositivo: tipoImpositivo,
                    tipoValor: tipoValor,
                }
                if (tipoValor === "porcentaje") {
                    const resultadoApliacado = new Decimal(precioNetoApartamentoPorDia).times(tipoImpositivo.dividedBy(100))

                    sumaTotalImpuestos = new Decimal(sumaTotalImpuestos).plus(resultadoApliacado)
                    impuestosFinal.totalImpuesto = resultadoApliacado.toDecimalPlaces(2).toString();
                }
                if (tipoValor === "tasa") {
                    sumaTotalImpuestos = new Decimal(sumaTotalImpuestos).plus(tipoImpositivo)
                    impuestosFinal.totalImpuesto = new Decimal(tipoImpositivo).toDecimalPlaces(2).toString()
                }
                (detallesApartamento.impuestos).push(impuestosFinal)
            })

            let totalDiaBruto = new Decimal(sumaTotalImpuestos).plus(precioNetoApartamentoPorDia).toDecimalPlaces(2).toString()

            detallesApartamento.totalImpuestos = new Decimal(sumaTotalImpuestos).toDecimalPlaces(2).toString()
            detallesApartamento.totalBrutoPordia = totalDiaBruto;
        }


        return detallesApartamento

    } catch (errorCapturado) {
        throw errorCapturado
    }
























}
export {
    precioBaseApartamento
}