import { conexion } from "../../componentes/db.mjs";

export const insertarNuevoBloqueo = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const tipoBloqueoIDV = data.tipoBloqueoIDV
        const fechaInicio_ISO = data.fechaInicio_ISO || null
        const fechaFin_ISO = data.fechaFin_ISO || null
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
            tipoBloqueoIDV,
            fechaInicio_ISO,
            fechaFin_ISO,
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