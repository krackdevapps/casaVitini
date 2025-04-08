import Decimal from "decimal.js";
import { precioBaseApartamento } from "../../../shared/contenedorFinanciero/entidades/reserva/precioBaseApartamento.mjs";

import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";


export const detallePrecioBaseApartamento = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const transaccionInterna = await precioBaseApartamento(apartamentoIDV);
        transaccionInterna.impuestos.forEach((impuesto) => {
            const tipoImpositivo = impuesto.tipoImpositivo;
            const totalImpuesto = impuesto.totalImpuesto;
            impuesto.tipoImpositivo = new Decimal(tipoImpositivo).toFixed(2);
            impuesto.totalImpuesto = new Decimal(totalImpuesto).toFixed(2);
        });

        const ok = {
            ok: transaccionInterna
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}