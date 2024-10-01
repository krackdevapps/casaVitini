import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerImpuestosPorEntidadIDV } from "../../../infraestructure/repository/impuestos/obtenerImpuestosPorEntidadIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import Decimal from "decimal.js";

export const previsualizarPrecioApartamento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const propuestaPrecio = validadoresCompartidos.tipos.cadena({
            string: entrada.body.propuestaPrecio,
            nombreCampo: "El campo propuestaPrecio",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        const detallesApartamento = {};
        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        detallesApartamento.apartamentoUI = apartamentoUI;
        detallesApartamento.apartamentoIDV = apartamentoIDV;
        const precioNetoApartamentoPorNoche = propuestaPrecio;
        detallesApartamento.precioNetoPorNochePropuesto = precioNetoApartamentoPorNoche;
        detallesApartamento.totalImpuestos = "0.00";
        detallesApartamento.totalBrutoPorNoche = precioNetoApartamentoPorNoche;
        detallesApartamento.impuestos = [];


        const listaImpuestos = await obtenerImpuestosPorEntidadIDV({
            entidadIDV: "reserva",
            estadoIDV: "activado"
        })

        if (listaImpuestos.length > 0) {
            let sumaTotalImpuestos = 0;
            listaImpuestos.forEach((detalleImpuesto) => {
                const tipoImpositivo = detalleImpuesto.tipoImpositivo;
                const nombreImpuesto = detalleImpuesto.nombre;
                const tipoValorIDV = detalleImpuesto.tipoValorIDV;
                const impuestoUID = detalleImpuesto.impuestoUID
                const impuestosFinal = {
                    nombreImpuesto: nombreImpuesto,
                    tipoImpositivo: tipoImpositivo,
                    tipoValorIDV: tipoValorIDV,
                    impuestoUID
                };
                if (tipoValorIDV === "porcentaje") {
                    const resultadoApliacado = (precioNetoApartamentoPorNoche * (tipoImpositivo / 100)).toFixed(2);
                    sumaTotalImpuestos += parseFloat(resultadoApliacado);
                    impuestosFinal.totalImpuesto = resultadoApliacado;
                }
                if (tipoValorIDV === "tasa") {
                    sumaTotalImpuestos += parseFloat(tipoImpositivo);
                    impuestosFinal.totalImpuesto = tipoImpositivo;
                }
                (detallesApartamento.impuestos).push(impuestosFinal);
            });
            let totalDiaBruto = Number(sumaTotalImpuestos) + Number(precioNetoApartamentoPorNoche);
            totalDiaBruto = totalDiaBruto.toFixed(2);
            detallesApartamento.totalImpuestos = Decimal(sumaTotalImpuestos).toFixed(2);
            detallesApartamento.totalBrutoPordia = Decimal(totalDiaBruto).toFixed(2);
        }
        const ok = {
            ok: detallesApartamento
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}