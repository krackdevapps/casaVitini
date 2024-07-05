import { conexion } from "../../../componentes/db.mjs";

export const actualizarZonaIDVDeLaConfiguracion = async (data) => {
    try {
        const nuevaZona = data.nuevaZona
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        UPDATE "configuracionApartamento"
        SET "zonaIDV" = $1
        WHERE "apartamentoIDV" = $2
        RETURNING 
        *;
        `
        const resuelve = await conexion.query(consulta, [nuevaZona, apartamentoIDV]);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún apartamento con el identicador visual por lo tanto no se puede actualizar el estado";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}