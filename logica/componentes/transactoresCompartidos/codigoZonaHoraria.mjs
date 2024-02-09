import { conexion } from "../db.mjs"
const codigoZonaHoraria = async () => {
    const consultaZonaHorariaConfigurada = `
    SELECT
    "zonaHoraria"
    FROM 
    "configuracionGlobal"
    WHERE 
    "configuracionUID" = $1;`
    const configuracionUID = "zonaHoraria"
    const resuelveConsultaZonaHorariaConfigurada = await conexion.query(consultaZonaHorariaConfigurada, [configuracionUID])
    const ok = {}
    if (resuelveConsultaZonaHorariaConfigurada.rowCount === 1) {
        ok.zonaHoraria = resuelveConsultaZonaHorariaConfigurada.rows[0].zonaHoraria
    }
    return ok
}
export {
    codigoZonaHoraria
}