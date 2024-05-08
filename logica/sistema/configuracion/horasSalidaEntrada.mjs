import { conexion } from "../../componentes/db.mjs";

export const horasSalidaEntrada = async () => {
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
        const resuelveConfiguracionGlobal = await conexion.query(consultasHorasSalidaYEntrada, configuracionUID);
        const detallesConfiguracion = resuelveConfiguracionGlobal.rows;
        const estructuraFinal = {};
        for (const parConfirmacion of detallesConfiguracion) {
            const configuracionUID = parConfirmacion.configuracionUID;
            const valor = parConfirmacion.valor;
            estructuraFinal[configuracionUID] = valor;
        }
        return estructuraFinal;
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}