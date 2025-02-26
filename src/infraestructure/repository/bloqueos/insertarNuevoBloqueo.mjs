import { conexion } from "../globales/db.mjs";

export const insertarNuevoBloqueo = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const tipoBloqueoIDV = data.tipoBloqueoIDV
        const fechaInicio = data.fechaInicio || null
        const fechaFin = data.fechaFin || null
        const motivo = data.motivo
        const zonaIDV = data.zonaIDV
        const testingVI = data.testingVI

        const consulta = `
        INSERT INTO "bloqueosApartamentos"
        (
        "apartamentoIDV",
        "tipoBloqueoIDV",
        "fechaInicio",
        "fechaFin",
        motivo,
        "zonaIDV",
        "testingVI"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING 
        *
        `;
        const parametros = [
            apartamentoIDV,
            tipoBloqueoIDV,
            fechaInicio,
            fechaFin,
            motivo,
            zonaIDV,
            testingVI
        ];
        const resuelve = await conexion.query(consulta, parametros)
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido insertar el nuevo bloqueo";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}