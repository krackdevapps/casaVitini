import ICAL from 'ical.js';
import { VitiniIDX } from '../../../../../shared/VitiniIDX/control.mjs';
import { validadoresCompartidos } from '../../../../../shared/validadores/validadoresCompartidos.mjs';
import { obtenerConfiguracionPorApartamentoIDV } from '../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { actualizarCalendarioSincronizado } from '../../../../../infraestructure/repository/calendario/actualizarCalendarioSincronizado.mjs';
import { obtenerCalendarioPorCalendarioUID } from '../../../../../infraestructure/repository/calendario/obtenerCalendarioPorCalendarioUID.mjs';
import axios from 'axios';


export const actualizarCalendario = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })
        const calendarioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.calendarioUID,
            nombreCampo: "El campo calendarioUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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
                "airbnb.com",
                "airbnb.es",
                "www.airbnb.es",
                "www.booking.com",
                "booking.com",
                "www.booking.es",
                "booking.es"
            ]
        })

        await obtenerCalendarioPorCalendarioUID(calendarioUID)
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        let calendarioRaw = null;
        if (url) {
            const errorDeFormado = "En la dirección URL que has introducido no hay un calendario iCal de Airbnb";
            try {
                const calendarioData = await axios.get(url);
                calendarioRaw = calendarioData.data;
                const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                const jcal = new ICAL.Component(jcalData); // Crea un componente jCal


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