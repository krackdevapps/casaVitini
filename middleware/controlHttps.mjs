export const controlHTTPS = (entrada, salida, siguiente) => {
    const dominioDePeticion = entrada.headers.host
    if (dominioDePeticion === 'lripoll.ddns.net' || dominioDePeticion === 'www.casavitini.com') {
        return salida.redirect(301, 'https://casavitini.com' + entrada.originalUrl);
    } else if (!entrada.secure && (dominioDePeticion !== "localhost")) {
        return salida.redirect(301, 'https://' + entrada.hostname + entrada.url);
    }
    siguiente();
}