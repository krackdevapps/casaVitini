
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerPerfilPrecioPorApartamentoIDV } from "../../../infraestructure/repository/precios/obtenerPerfilPrecioPorApartamentoIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerImpuestosPorEntidadIDV } from "../../../infraestructure/repository/impuestos/obtenerImpuestosPorEntidadIDV.mjs";

export const listaPreciosApartamentos = async (entrada, salida) => {
    try {


        const configuracionesDeAlojamiento = await obtenerTodasLasConfiguracionDeLosApartamento()


        const listaImpuestos = await obtenerImpuestosPorEntidadIDV({
            entidadIDV: "reserva",
            estadoIDV: "activado"
        })


        const objetoFInal = [];
        for (const apartamentoEncotrado of configuracionesDeAlojamiento) {
            const apartamentoIDV = apartamentoEncotrado.apartamentoIDV;
            const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })).apartamentoUI
            const apartamento = {
                apartamento: apartamentoIDV,
                apartamentoUI: apartamentoUI
            };
            const precioConfiguracionAlojamiento = await obtenerPerfilPrecioPorApartamentoIDV(apartamentoIDV)

            const precioEncontrados = precioConfiguracionAlojamiento;
            const precioApartamento = precioEncontrados.precio;
            const monedaIDV = precioEncontrados.monedaIDV;
            const precioUID = precioEncontrados.precioUID;
            apartamento.precioUID = precioUID;
            apartamento.precio = precioApartamento;
            apartamento.monedaIDV = monedaIDV;
            apartamento.totalImpuestos = "0.00";
            apartamento.totalNocheBruto = precioApartamento;

            if (listaImpuestos.length > 0) {
                apartamento.totalImpuestos = 0;
                let sumaTotalImpuestos = 0;
                listaImpuestos.forEach((detalleImpuesto) => {
                    const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                    const tipoValorIDV = detalleImpuesto.tipoValorIDV;
                    if (tipoValorIDV === "porcentaje") {
                        const resultadoApliacado = (precioApartamento * (tipoImpositivo / 100)).toFixed(2);
                        sumaTotalImpuestos += parseFloat(resultadoApliacado);
                    }
                    if (tipoValorIDV === "tasa") {
                        sumaTotalImpuestos += parseFloat(tipoImpositivo);
                    }
                });
                apartamento.totalImpuestos = Number(sumaTotalImpuestos).toFixed(2);
                const totalNocheBruto = Number(sumaTotalImpuestos) + Number(precioApartamento);
                apartamento.totalNocheBruto = totalNocheBruto.toFixed(2);
            }

            objetoFInal.push(apartamento);
        }
        const ok = {
            ok: objetoFInal
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
    }

}