import { conexion } from "../../componentes/db.mjs";

export const insertarNuevoBloqueo = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const tipoBloqueo = data.tipoBloqueo
        const fechaInicio_ISO = data.fechaInicio_ISO
        const fechaFin_ISO = data.fechaFin_ISO
        const motivo = data.motivo
        const zonaUI = data.zonaUI

        const consulta = `
        INSERT INTO "bloqueosApartamentos"
        (
        apartamento,
        "tipoBloqueo",
        entrada,
        salida,
        motivo,
        zona
        )
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING uid
        `;
        const parametros = [
            apartamentoIDV,
            tipoBloqueo,
            fechaInicio_ISO,
            fechaFin_ISO,
            motivo,
            zonaUI
        ];
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}