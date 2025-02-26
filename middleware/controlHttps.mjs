export const controlHTTPS = (entrada, salida, siguiente) => {
    const dominioDePeticion = entrada.headers.host
    if (!entrada.secure && (dominioDePeticion !== "localhost")) {
        return salida.redirect(301, 'https://' + entrada.hostname + entrada.url);
    }
    siguiente();
}