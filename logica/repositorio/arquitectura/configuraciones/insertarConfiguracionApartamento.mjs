import { conexion } from "../../../componentes/db.mjs";

export const insertarConfiguracionApartamento = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const estadoInicial = data.estadoInicial

        const consulta = `
        INSERT INTO "configuracionApartamento"
        (
        "apartamentoIDV",
        "estadoConfiguracionIDV"
        )
        VALUES 
        (
        $1,
        $2
        )
        RETURNING 
        *
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV, estadoInicial]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la nueva configuracion de alojamiento"
            throw error
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}