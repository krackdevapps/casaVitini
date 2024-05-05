import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";


export const previsualizarPrecioApartamento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadena = /^[a-z0-9]+$/;
        const propuestaPrecio = entrada.body.propuestaPrecio;
        
        if (typeof apartamentoIDV !== "string") {
            const error = "El campo apartamentoIDV debe de ser una cadena";
            throw new Error(error);
        }
        if (!filtroCadena.test(apartamentoIDV)) {
            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios";
            throw new Error(error);
        }
        const filtroPropuestaPrecio = /^\d+\.\d{2}$/;
        if (!filtroPropuestaPrecio.test(propuestaPrecio)) {
            const error = "El campo propuestaPrecio solo puede ser un numero con dos decimales y nada mas, los decimales deben de separarse con un punto y no una coma, por ejemplo si quieres poner un precio de 10, tienes que escribir 10.00";
            throw new Error(error);
        }
        const validarApartamento = `
                            SELECT
                            "apartamentoIDV"
                            FROM 
                            "configuracionApartamento"
                            WHERE "apartamentoIDV" = $1
                            `;
        const resuelveValidarApartamento = await conexion.query(validarApartamento, [apartamentoIDV]);
        if (resuelveValidarApartamento.rowCount === 0) {
            const error = "No existe el apartamenro";
            throw new Error(error);
        }
        const detallesApartamento = {};
        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
        detallesApartamento.apartamentoUI = apartamentoUI;
        detallesApartamento.apartamentoIDV = apartamentoIDV;
        const precioNetoApartamentoPorDia = propuestaPrecio;
        detallesApartamento.precioNetoPorDiaPropuesto = precioNetoApartamentoPorDia;
        detallesApartamento.totalImpuestos = "0.00";
        detallesApartamento.totalBrutoPordia = precioNetoApartamentoPorDia;
        detallesApartamento.impuestos = [];

        const seleccionarImpuestos = `
                            SELECT
                            nombre, "tipoImpositivo", "tipoValor"
                            FROM
                            impuestos
                            WHERE
                            ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;
    
                            `;
        const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto", "activado"]);
        if (resuelveSeleccionarImpuestos.rowCount > 0) {
            const impuestosEncontrados = resuelveSeleccionarImpuestos.rows;
            let impuestosFinal;
            let sumaTotalImpuestos = 0;
            impuestosEncontrados.map((detalleImpuesto) => {
                const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                const nombreImpuesto = detalleImpuesto.nombre;
                const tipoValor = detalleImpuesto.tipoValor;
                impuestosFinal = {
                    "nombreImpuesto": nombreImpuesto,
                    "tipoImpositivo": tipoImpositivo,
                    "tipoValor": tipoValor,
                };
                if (tipoValor === "porcentaje") {
                    const resultadoApliacado = (precioNetoApartamentoPorDia * (tipoImpositivo / 100)).toFixed(2);
                    sumaTotalImpuestos += parseFloat(resultadoApliacado);
                    impuestosFinal.totalImpuesto = resultadoApliacado;
                }
                if (tipoValor === "tasa") {
                    sumaTotalImpuestos += parseFloat(tipoImpositivo);
                    impuestosFinal.totalImpuesto = tipoImpositivo;
                }
                (detallesApartamento.impuestos).push(impuestosFinal);
            });
            let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorDia);
            totalDiaBruto = totalDiaBruto.toFixed(2);
            detallesApartamento.totalImpuestos = sumaTotalImpuestos;
            detallesApartamento.totalBrutoPordia = totalDiaBruto;
        }
        const ok = {
            ok: detallesApartamento
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }

}