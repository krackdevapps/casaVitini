import Decimal from "decimal.js";
import { precioBaseApartamento } from "../../../sistema/sistemaDePrecios/precioBaseApartamento.mjs";

export const detallePrecioBaseApartamento = async (entrada, salida) => {
    try {
        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadena = /^[a-z0-9]+$/;
        if (typeof apartamentoIDV !== "string" || !filtroCadena.test(apartamentoIDV)) {
            const error = "El campo apartamentoIDV solo puede ser un una cadena de minúsculas y numeros, ni siquera espacios";
            throw new Error(error);
        }
        const transaccionInterna = await precioBaseApartamento(apartamentoIDV);

        //  transaccionInterna.precioNetoPorDia = new Decimal(transaccionInterna.precioNetoPorDia).toFixed(2)
        //  transaccionInterna.totalImpuestos = new Decimal(transaccionInterna.totalImpuestos).toFixed(2)
        //  transaccionInterna.totalBrutoPordia = new Decimal(transaccionInterna.totalBrutoPordia).toFixed(2)
        transaccionInterna.impuestos.map((impuesto) => {
            const tipoImpositivo = impuesto.tipoImpositivo;
            const totalImpuesto = impuesto.totalImpuesto;
            impuesto.tipoImpositivo = new Decimal(tipoImpositivo).toFixed(2);
            impuesto.totalImpuesto = new Decimal(totalImpuesto).toFixed(2);
        });


        const ok = {
            ok: transaccionInterna
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