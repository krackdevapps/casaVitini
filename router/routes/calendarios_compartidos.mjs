import { validadoresCompartidos } from "../../src/shared/validadores/validadoresCompartidos.mjs";
import { calendariosCompartidos } from '../../src/shared/calendariosSincronizados/calendariosCompartidos.mjs';
import { filtroError } from "../../src/shared/error/filtroError.mjs";

export const calendarios_compartidos = async (entrada, salida) => {
    try {

        const urlPath = validadoresCompartidos.tipos.urlPath({
            urlPath: entrada.url.toLowerCase(),
            nombreCampo: "La URL no cumple el formato esperado."
        })
        const urlArray = urlPath.toLowerCase()
            .split("/")
            .filter(urlPath => urlPath.trim() !== "calendarios_compartidos")
            .filter(urlPath => urlPath.trim() !== "");
        const formato = urlArray[0].split(":")[1];
        const calendarioUIDPublico = urlArray[1];

        const contenedorFormatosIDV = [
            "ics_v2",
            "ics_v2_airbnb"
        ]
        if (!contenedorFormatosIDV.includes(formato)) {
            const m = "No se reconoce el formato del calendario solicidado, los formatos solo pueden ser ics_v2 o ics_v2_airbnb"
            throw new Error(m)
        }

        const calendarioPublico = await calendariosCompartidos({
            calendarioUIDPublico,
            formato
        })

        const nombreFinalCalendarioIDV = "casaVitini-calendar-" + calendarioUIDPublico
        salida.attachment(nombreFinalCalendarioIDV);
        salida.setHeader('Content-Disposition', `inline; filename="${nombreFinalCalendarioIDV}"`);
        salida.send(calendarioPublico);

    } catch (errorCapturado) {

        const errorFinal = filtroError(errorCapturado);
        salida.status(404)
        salida.json(errorFinal);
    }
};
