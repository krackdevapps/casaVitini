import { obtenerParConfiguracion } from "../../infraestructure/repository/configuracion/parConfiguracion/obtenerParConfiguracion.mjs"
export const codigoZonaHoraria = async () => {
    const configuracion = await obtenerParConfiguracion(["zonaHoraria"])
    return configuracion
}
