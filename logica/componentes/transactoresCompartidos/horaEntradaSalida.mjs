import { conexion } from "../db.mjs"
const horaEntradaSalida = async () => {
    try {
        const consultasHorasSalidaYEntrada = `
        SELECT 
            valor,
            "configuracionUID"
        FROM 
            "configuracionGlobal"
        WHERE 
            "configuracionUID" IN ($1, $2, $3);
       `;

        const configuracionUID = [
            "horaEntradaTZ",
            "horaSalidaTZ",
            "zonaHoraria"
        ];
        const resuelveConfiguracionGlobal = await conexion.query(consultasHorasSalidaYEntrada, configuracionUID)
        const detallesConfiguracion = resuelveConfiguracionGlobal.rows
        const estructuraFinal = {}
        for (const parConfirmacion of detallesConfiguracion) {
            const configuracionUID = parConfirmacion.configuracionUID
            const valor = parConfirmacion.valor
            estructuraFinal[configuracionUID] = valor
        }

        const horaEntradaArray = estructuraFinal.horaEntradaTZ.split(":")
        const horaEntrda_HORA = horaEntradaArray[0]
        const horaEntrda_MINUTO = horaEntradaArray[1]


        const horaSalidaArray = estructuraFinal.horaSalidaTZ.split(":")
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
export {
    horaEntradaSalida
}