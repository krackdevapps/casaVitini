import { clienteSquare } from "../../squareClient.mjs";
export const crearPago = async (pago) => {
    try {
        const { result: { payment } } = await clienteSquare.paymentsApi.createPayment(pago);
        const result = JSON.stringify(payment, (key, value) => {
            return typeof value === "bigint" ? parseInt(value) : value;
        }, 4);
        const resultado = JSON.parse(result);
        return resultado;
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}