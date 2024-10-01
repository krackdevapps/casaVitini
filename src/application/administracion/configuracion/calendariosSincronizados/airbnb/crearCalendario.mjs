import ICAL from 'ical.js';
import { VitiniIDX } from '../../../../../shared/VitiniIDX/control.mjs';
import { validadoresCompartidos } from '../../../../../shared/validadores/validadoresCompartidos.mjs';

import { obtenerConfiguracionPorApartamentoIDV } from '../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { campoDeTransaccion } from '../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs';
import { obtenerCalendarioPorCalendarioUIDPublico } from '../../../../../infraestructure/repository/calendario/obtenerCalendarioPorCalendarioUIDPublico.mjs';
import { insertarCalendarioSincronizado } from '../../../../../infraestructure/repository/calendario/insertarCalendarioSincronizado.mjs';
import axios from 'axios';

export const crearCalendario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
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

        await campoDeTransaccion("iniciar")
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
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
            //url: url,
            apartamentoIDV: apartamentoIDV,
            plataformaOrigen: plataformaOrigen,
            codigoAleatorioUnico: codigoAleatorioUnico
        }

        const nuevoCalendario = await insertarCalendarioSincronizado(dataInsertarCalendarioSincronizado)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha guardado el nuevo calendario y está listo para ser sincronizado.",
            nuevoUID: nuevoCalendario.calendarioUID
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}