import { clienteSquare } from "../../squareClient.mjs";

export const detallesDelPago = async (pagoUID) => {
    try {
        const { result: { payment } } = await clienteSquare.paymentsApi.getPayment(pagoUID);
        const result = JSON.stringify(payment, (key, value) => {
            return typeof value === "bigint" ? parseInt(value) : value;
        }, 4);
        const detallesDelPagoOL = JSON.parse(result);
        return detallesDelPagoOL;
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}