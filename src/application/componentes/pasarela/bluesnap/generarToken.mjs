export const generarToken = async (entrada, salida) => {
    const m = "Funcion deshabilitada"
    throw new Error(m)
    const entornoApi = process.env.BLUESNAP_ENTORNO;
    const blueSnapUser = process.env.BLUESNAP_USER;
    const blueSnapPass = process.env.BLUESNAP_PASS;
    const authBase64 = Buffer.from(`${blueSnapUser}:${blueSnapPass}`).toString('base64');
    let url;
    if (entornoApi === "sandbox") {
        url = 'https://sandbox.bluesnap.com/services/2/payment-fields-tokens';
    }
    if (entornoApi === "pro") {
        url = 'https://ws.bluesnap.com/services/2/payment-fields-tokens';
    }
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authBase64}`,
        'Host': 'sandbox.bluesnap.com'
    };
    const data = {

    };
    try {
        const response = await axios.post(url, data, { headers });
        const location = response.headers.location;
        const locationUrlArray = location.split("/");
        const tokenFronURL = locationUrlArray[locationUrlArray.length - 1];
        const token = tokenFronURL;
        const ok = {
            token: token
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}