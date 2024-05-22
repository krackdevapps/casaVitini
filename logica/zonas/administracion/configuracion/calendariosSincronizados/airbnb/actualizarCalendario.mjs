import ICAL from 'ical.js';
import { VitiniIDX } from '../../../../../sistema/VitiniIDX/control.mjs';
import { validadoresCompartidos } from '../../../../../sistema/validadores/validadoresCompartidos.mjs';

import { obtenerCalendarioPorCalendarioUID } from '../../../../../repositorio/configuracion/calendarioSincronizados/obtenerCalendarioPorCalendarioUID.mjs';
import { obtenerConfiguracionPorApartamentoIDV } from '../../../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs';
import { actualizarCalendarioSincronizado } from '../../../../../repositorio/configuracion/calendarioSincronizados/actualizarCalendarioSincronizado.mjs';

export const actualizarCalendario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo nuevoPreci",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nombre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombre,
            nombreCampo: "El campo del nombre",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const url = validadoresCompartidos.tipos.url({
            url: entrada.body.url,
            nombreCampo: "El campo de la url del calendario",
            arrayDeDominiosPermitidos: [
                "www.airbnb.com",
                "airbnb.com"
            ]
        })

        await obtenerCalendarioPorCalendarioUID(calendarioUID)
        await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

        let calendarioRaw = null;
        if (url) {
            const errorDeFormado = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb";
            try {
                const calendarioData = await axios.get(url);
                calendarioRaw = calendarioData.data;
                const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                const jcal = new ICAL.Component(jcalData); // Crea un componente jCal

                // Verifica si el componente es un calendario (VCALENDAR)
                if (jcal?.name.toLowerCase() !== 'vcalendar') {
                    throw new Error(errorDeFormado);
                }
            } catch (errorCapturado) {
                throw new Error(errorDeFormado);
            }
        }

        const dataActualizarCalendarioSincronizado = {
            nombre: nombre,
            url: url,
            apartamentoIDV: apartamentoIDV,
            calendarioRaw: calendarioRaw,
            calendarioUID: calendarioUID
        }

        await actualizarCalendarioSincronizado(dataActualizarCalendarioSincronizado)
        const ok = {
            ok: "Se ha actualizado correctamente el calendario"
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }

}