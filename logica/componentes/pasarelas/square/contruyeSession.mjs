import { clienteSquare } from "./squareClient.mjs";
export const contruyeSession = async () => {
    try {
        const locationResponse = await clienteSquare.locationsApi.retrieveLocation(process.env.SQUARE_LOCATION_ID);
        const currency = locationResponse.result.location.currency;
        const country = locationResponse.result.location.country;
        const idempotencyKey = uuidv4();
        const clienteMetadatos = {
            squareApplicationId: SQUARE_APPLICATION_ID,
            squareLocationId: SQUARE_LOCATION_ID,
            squareAccountCountry: country,
            squareAccountCurrency: currency,
            idempotencyKey
        };
        return clienteMetadatos;
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}