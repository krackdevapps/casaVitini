export const relojlUTC = () => {
    try {
        const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (zonaHoraria !== 'UTC') {
            const error = "ALERTA!!!!!! El sistema no está configurado en UTC. !!!!!!";
            //throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}