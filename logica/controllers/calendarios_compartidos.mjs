import { filtroError } from "../sistema/error/filtroError.mjs";
import { validadoresCompartidos } from "../sistema/validadores/validadoresCompartidos.mjs";
import { calendariosCompartidos } from '../sistema/calendariosSincronizados/calendariosCompartidos.mjs';

export const calendarios_compartidos = async (entrada, salida) => {
    try {
        const urlPath = validadoresCompartidos.tipos.urlPath({
            urlPath: entrada.url.toLowerCase(),
            nombreCampo: "La url no cumple el formato esperado"
        })
        const urlArray = urlPath.toLowerCase()
            .split("/")
            .filter(urlPath => urlPath.trim() !== "calendarios_compartidos")
            .filter(urlPath => urlPath.trim() !== "");
        const calendarioUIDPublico = urlArray[0];
        const calendarioPublico = await calendariosCompartidos(calendarioUIDPublico)
        salida.attachment('eventos.ics');
        salida.send(calendarioPublico);

    } catch (errorCapturado) {
        console.log("errorCapturado", errorCapturado)
        const errorFinal = filtroError(errorCapturado);
        salida.status(404)
        salida.json(errorFinal);
    }
};
