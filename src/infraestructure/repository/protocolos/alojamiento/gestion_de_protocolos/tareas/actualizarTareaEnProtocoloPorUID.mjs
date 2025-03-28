import { conexion } from "../../../../globales/db.mjs";

export const actualizarTareaEnProtocoloPorUID = async (data) => {
    try {
        const uid = data.uid
        const tareaUI = data.tareaUI
        const tipoDiasIDV = data.tipoDiasIDV


        const consulta = `
        UPDATE  protocolos."tareasAlojamiento"
        SET 
        "tareaUI" = $1,
        "tipoDiasIDV" = $2
        WHERE
        uid = $3
        RETURNING
        *
        `;
        const parametros = [
            tareaUI,
            tipoDiasIDV,
            uid
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe la tarea revisa el UID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}