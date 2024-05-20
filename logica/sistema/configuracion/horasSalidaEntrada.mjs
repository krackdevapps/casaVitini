import { obtenerParConfiguracion } from "../../repositorio/configuracion/obtenerParConfiguracion.mjs";

export const horasSalidaEntrada = async () => {
    try {
        const configuracionPar = await obtenerParConfiguracion([
            "horaEntradaTZ",
            "horaSalidaTZ",
            "zonaHoraria"
        ])
        return configuracionPar
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}