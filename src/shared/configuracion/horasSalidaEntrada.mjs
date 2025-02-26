import { obtenerParametroConfiguracion } from "./obtenerParametroConfiguracion.mjs";

export const horasSalidaEntrada = async () => {
    try {
        const configuracionPar = await obtenerParametroConfiguracion([
            "horaEntradaTZ",
            "horaSalidaTZ",
            "zonaHoraria"
        ])
        return configuracionPar
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}