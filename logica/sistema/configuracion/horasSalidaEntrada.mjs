import { obtenerParConfiguracion } from "../../repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";

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