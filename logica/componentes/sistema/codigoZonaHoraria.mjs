import { conexion } from "../db.mjs"
const codigoZonaHoraria = async () => {
    const zonaHorariaUID = "zonaHoraria"
    const consultaZonaHorariaConfigurada = `
    SELECT
    valor
    FROM 
    "configuracionGlobal"
    WHERE 
    "configuracionUID" = $1;`
    const resuelveConsultaZonaHorariaConfigurada = await conexion.query(consultaZonaHorariaConfigurada, [zonaHorariaUID])
    const ok = {}
    if (resuelveConsultaZonaHorariaConfigurada.rowCount === 1) {
        ok.zonaHoraria = resuelveConsultaZonaHorariaConfigurada.rows[0].valor
    }
    return ok
}
export {
    codigoZonaHoraria
}