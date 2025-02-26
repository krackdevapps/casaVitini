import { obtenerParametroConfiguracion } from "./obtenerParametroConfiguracion.mjs"
export const codigoZonaHoraria = async () => {
    const configuracion = await obtenerParametroConfiguracion(["zonaHoraria"])
    return configuracion
}
