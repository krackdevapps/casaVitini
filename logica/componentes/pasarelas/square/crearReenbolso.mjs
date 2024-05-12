import { clienteSquare } from "./squareClient.mjs";

export const crearReenbolso = async (reembolso) => {
    try {
        const { result: { refund } } = await clienteSquare.refundsApi.refundPayment(reembolso);
        const result = JSON.stringify(refund, (key, value) => {
            return typeof value === "bigint" ? parseInt(value) : value;
        }, 4);
        const reembolsoOL = JSON.parse(result);
        return reembolsoOL;
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}