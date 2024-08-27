import { filtroError } from "../sistema/error/filtroError.mjs";
import { validadoresCompartidos } from "../sistema/validadores/validadoresCompartidos.mjs";
import { calendariosCompartidos } from '../sistema/calendariosSincronizados/calendariosCompartidos.mjs';

export const calendarios_compartidos = async (entrada, salida) => {
    try {
        console.log("entrada calendario compartido", entrada.body)
        const urlPath = validadoresCompartidos.tipos.urlPath({
            urlPath: entrada.url.toLowerCase(),
            nombreCampo: "La URL no cumple el formato esperado."
        })
        console.log("urlPath", urlPath)
        console.log("entrada", entrada)

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
            const m = "No se reconoce el formato del calendario solicidado, los formatos solo pueden ser ics_v1 o ics_v1_airbnb"
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
