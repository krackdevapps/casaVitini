import ICAL from 'ical.js';
import { VitiniIDX } from '../../../../../sistema/VitiniIDX/control.mjs';
import { validadoresCompartidos } from '../../../../../sistema/validadores/validadoresCompartidos.mjs';

import { obtenerConfiguracionPorApartamentoIDV } from '../../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { campoDeTransaccion } from '../../../../../repositorio/globales/campoDeTransaccion.mjs';
import { obtenerCalendarioPorCalendarioUIDPublico } from '../../../../../repositorio/calendario/obtenerCalendarioPorCalendarioUIDPublico.mjs';
import { insertarCalendarioSincronizado } from '../../../../../repositorio/calendario/insertarCalendarioSincronizado.mjs';
import axios from 'axios';

export const crearCalendario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

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
        await campoDeTransaccion("iniciar")
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })

        const errorDeFormato = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb";
        let calendarioRaw;
        try {
            const maxContentLengthBytes = 10 * 1024 * 1024; // 10 MB
            const calendarioData = await axios.get(url, {
                maxContentLength: maxContentLengthBytes,
            }); calendarioRaw = calendarioData.data;
            const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
            const jcal = new ICAL.Component(jcalData); // Crea un componente jCal


            // Verifica si el componente es un calendario (VCALENDAR)
            if (jcal?.name.toLowerCase() !== 'vcalendar') {
                throw new Error(errorDeFormato);
            }
        } catch (errorCapturado) {

            throw new Error(errorDeFormato);
        }
        const generarCadenaAleatoria = (longitud) => {
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria + ".ics";
        };
        const validarCodigo = async (codigoAleatorio) => {
            const calendario = await obtenerCalendarioPorCalendarioUIDPublico({
                publicoUID: codigoAleatorio,
                errorSi: "desactivado"
            })
            if (calendario.length > 0) {
                return true;
            } else {
                return false
            }
        };
        const controlCodigo = async () => {
            const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
            let codigoGenerado;
            let codigoExiste;
            do {
                codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                codigoExiste = await validarCodigo(codigoGenerado);
            } while (codigoExiste);
            // En este punto, tenemos un código único que no existe en la base de datos
            return codigoGenerado;
        };
        const codigoAleatorioUnico = await controlCodigo();
        const plataformaOrigen = "airbnb";
        const dataInsertarCalendarioSincronizado = {
            nombre: nombre,
            url: url,
            apartamentoIDV: apartamentoIDV,
            plataformaOrigen: plataformaOrigen,
            calendarioRaw: calendarioRaw,
            codigoAleatorioUnico: codigoAleatorioUnico
        }

        const nuevoCalendario = await insertarCalendarioSincronizado(dataInsertarCalendarioSincronizado)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha guardado el nuevo calendario y esta listo para ser sincronizado",
            nuevoUID: nuevoCalendario.calendarioUID
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}