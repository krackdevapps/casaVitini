import { conexion } from "../../../../globales/db.mjs";

export const insertarTareaEnProtocoloAlojamiento = async (data) => {
    try {
        
        const apartamentoIDV = data.apartamentoIDV
        const tareaUI = data.tareaUI
        const tipoDiasIDV = data.tipoDiasIDV
        const posicion = data.posicion

        const consulta = `
        INSERT INTO protocolos."tareasAlojamiento"
        (
        "apartamentoIDV",
        "tareaUI",
        "tipoDiasIDV",
        posicion
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `;
        const parametros = [
            apartamentoIDV,
            tareaUI,
            tipoDiasIDV,
            posicion

        ];
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la tarea en el protocolo de alojamiento."
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}