import { conexion } from "../../globales/db.mjs";

export const actualizaConfiguracionDeProtocolos = async (data) => {
    try {
        const diasCaducidadRevision = data.diasCaducidadRevision
        const diasAntelacionPorReserva = data.diasAntelacionPorReserva

        const consultaPreEliminar = `
            DELETE FROM protocolos."configuracionGlobal";
        `;
        await conexion.query(consultaPreEliminar);

        const consulta = `
        INSERT INTO protocolos."configuracionGlobal" (
        "diasCaducidadRevision",
        "diasAntelacionPorReserva"
        ) VALUES ($1, $2);
        `;
        const parametros = [
            diasCaducidadRevision,
            diasAntelacionPorReserva
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}