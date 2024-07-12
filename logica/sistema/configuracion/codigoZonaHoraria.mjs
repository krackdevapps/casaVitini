import { obtenerParConfiguracion } from "../../repositorio/configuracion/parConfiguracion/obtenerParConfiguracion.mjs"
export const codigoZonaHoraria = async () => {
    const configuracion = await obtenerParConfiguracion(["zonaHoraria"])
    return configuracion
}
