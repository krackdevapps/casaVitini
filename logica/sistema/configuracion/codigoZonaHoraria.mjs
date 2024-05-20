import { obtenerParConfiguracion } from "../../repositorio/configuracion/obtenerParConfiguracion.mjs"
export const codigoZonaHoraria = async () => {
    const configuracion = await obtenerParConfiguracion(["zonaHoraria"])
    const ok = {
        ok: configuracion
    }
    return ok
}
