import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../repositorio/arquitectura/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerImpuestosPorAplicacionSobre } from "../../../repositorio/impuestos/obtenerImpuestosPorAplicacionSobre.mjs";
import { obtenerPerfilPrecioPorApartamentoUID } from "../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs";

export const listaPreciosApartamentos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const configuracionesDeAlojamiento = await obtenerTodasLasConfiguracionDeLosApartamento()

        const dataImpuestosPorAplicacion = {
            aplicacionSobre: ["totalNeto", "totalReservaNeto"],
            estado: "activado"
        }
        const listaImpuestos = await obtenerImpuestosPorAplicacionSobre(dataImpuestosPorAplicacion)

 
        const objetoFInal = [];
        for (const apartamentoEncotrado of configuracionesDeAlojamiento) {
            const apartamentoIDV = apartamentoEncotrado.apartamentoIDV;
            const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
            const apartamento = {
                apartamento: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            const precioConfiguracionAlojamiento = await obtenerPerfilPrecioPorApartamentoUID(apartamentoIDV)

            if (precioConfiguracionAlojamiento.length === 1) {
                const precioEncontrados = precioConfiguracionAlojamiento;
                const precioApartamento = precioEncontrados.precio;
                const moneda = precioEncontrados.moneda;
                const uidPrecio = precioEncontrados.uid;
                apartamento.uid = uidPrecio;
                apartamento.precio = precioApartamento;
                apartamento.moneda = moneda;
                apartamento.totalImpuestos = "0.00";
                apartamento.totalDiaBruto = precioApartamento;

                if (listaImpuestos.length > 0) {
                    apartamento.totalImpuestos = 0;
                    let sumaTotalImpuestos = 0;
                    listaImpuestos.map((detalleImpuesto) => {
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
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }

}