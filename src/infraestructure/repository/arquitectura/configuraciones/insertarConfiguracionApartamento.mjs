import { conexion } from "../../globales/db.mjs";

export const insertarConfiguracionApartamento = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const estadoInicial = data.estadoInicial
        const zonaIDV = data.zonaIDV

        const consulta = `
        INSERT INTO "configuracionApartamento"
        (
        "apartamentoIDV",
        "estadoConfiguracionIDV",
        "zonaIDV"
        )
        VALUES 
        (
        $1,
        $2,
        $3
        )
        RETURNING 
        *
        `;
        const parametros = [
            apartamentoIDV,
            estadoInicial,
            zonaIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No se ha insertado la nueva configuración de alojamiento"
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}