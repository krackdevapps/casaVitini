import { conexion } from "../../componentes/db.mjs";

export const insertarNuevoBloqueo = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const tipoBloqueo = data.tipoBloqueo
        const fechaInicio = data.fechaInicio || null
        const fechaFin = data.fechaFin || null
        const motivo = data.motivo
        const zonaIDV = data.zonaIDV

        const consulta = `
        INSERT INTO "bloqueosApartamentos"
        (
        "apartamentoIDV",
        "tipoBloqueoIDV",
        "fechaInicio",
        "fechaFin",
        motivo,
        "zonaIDV"
        )
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING 
        *
        `;
        const parametros = [
            apartamentoIDV,
            tipoBloqueo,
            fechaInicio,
            fechaFin,
            motivo,
            zonaIDV
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