import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { resolverApartamentoUI } from "../../../sistema/resolucion/resolverApartamentoUI.mjs";


export const listaPreciosApartamentos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return
        
        const apartamentos = `
                                SELECT
                                "apartamentoIDV"
                                FROM 
                                "configuracionApartamento"
                                `;
        const resuelveApartamentos = await conexion.query(apartamentos);
        if (resuelveApartamentos.rowCount === 0) {
            const error = "No hay ningun apartamento en el sistema";
            throw new Error(error);
        }
        const apartamentosEncontrados = resuelveApartamentos.rows;
        const seleccionarImpuestos = `
                                SELECT
                                nombre, "tipoImpositivo", "tipoValor"
                                FROM
                                impuestos
                                WHERE
                                ("aplicacionSobre" = $1 OR "aplicacionSobre" = $2) AND estado = $3;
    
                                `;
        const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, ["totalNeto", "totalReservaNeto", "activado"]);
        const objetoFInal = [];
        for (const apartamentoEncotrado of apartamentosEncontrados) {
            const apartamentoIDV = apartamentoEncotrado.apartamentoIDV;
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
            const apartamento = {
                apartamento: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            const listarPreciosApartamentos = `
                                    SELECT
                                    uid, apartamento, precio, moneda
                                    FROM 
                                    "preciosApartamentos"
                                    WHERE apartamento = $1
                                    `;
            const resuelveListarPreciosApartamentos = await conexion.query(listarPreciosApartamentos, [apartamentoIDV]);
            if (resuelveListarPreciosApartamentos.rowCount === 1) {
                const precioEncontrados = resuelveListarPreciosApartamentos.rows[0];
                const precioApartamento = precioEncontrados.precio;
                const moneda = precioEncontrados.moneda;
                const uidPrecio = precioEncontrados.uid;
                apartamento.uid = uidPrecio;
                apartamento.precio = precioApartamento;
                apartamento.moneda = moneda;
                apartamento.totalImpuestos = "0.00";
                apartamento.totalDiaBruto = precioApartamento;

                if (resuelveSeleccionarImpuestos.rowCount > 0) {
                    const impuestosEncontrados = resuelveSeleccionarImpuestos.rows;
                    apartamento.totalImpuestos = 0;
                    let sumaTotalImpuestos = 0;
                    impuestosEncontrados.map((detalleImpuesto) => {
                        const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                        const tipoValor = detalleImpuesto.tipoValor;
                        if (tipoValor === "porcentaje") {
                            const resultadoApliacado = (precioApartamento * (tipoImpositivo / 100)).toFixed(2);
                            sumaTotalImpuestos += parseFloat(resultadoApliacado);
                        }
                        if (tipoValor === "tasa") {
                            sumaTotalImpuestos += parseFloat(tipoImpositivo);
                        }
                    });
                    apartamento.totalImpuestos = Number(sumaTotalImpuestos).toFixed(2);
                    const totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioApartamento);
                    apartamento.totalDiaBruto = totalDiaBruto.toFixed(2);
                }
            }
            objetoFInal.push(apartamento);
        }
        const ok = {
            ok: objetoFInal
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