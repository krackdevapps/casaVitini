import { clienteSquare } from "../../squareClient.mjs";

export const detallesDelReembolso = async (reembolsoUID) => {
    try {
        const { result: { refund } } = await clienteSquare.refundsApi.getPaymentRefund(reembolsoUID);
        const resultReembolso = JSON.stringify(refund, (key, value) => {
            return typeof value === "bigint" ? parseInt(value) : value;
        }, 4);
        const detallesDelReembolsoOL = JSON.parse(resultReembolso);
        return detallesDelReembolsoOL;
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}