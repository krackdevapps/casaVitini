import { obtenerParConfiguracion } from "../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs";

export const horaEntradaSalida = async () => {
    try {
        const configuracionesSolicitadas = [
            "horaEntradaTZ",
            "horaSalidaTZ",
            "zonaHoraria"
        ];
        const paresConfiguracion = await obtenerParConfiguracion(configuracionesSolicitadas)

        const estructuraFinal = {}





        const horaEntradaArray = paresConfiguracion.horaEntradaTZ.split(":")
        const horaEntrda_HORA = horaEntradaArray[0]
        const horaEntrda_MINUTO = horaEntradaArray[1]
        const horaSalidaArray = paresConfiguracion.horaSalidaTZ.split(":")
        const horaSalida_HORA = horaSalidaArray[0]
        const horaSalida_MINUTO = horaSalidaArray[1]
        estructuraFinal.horaEntrada_objeto = {
            hora: horaEntrda_HORA,
            minuto: horaEntrda_MINUTO
        }
        estructuraFinal.horaSalida_objeto = {
            hora: horaSalida_HORA,
            minuto: horaSalida_MINUTO
        }
        return estructuraFinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
