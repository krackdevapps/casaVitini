import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { selectorPorCondicion } from "../../../sistema/ofertas/entidades/reserva/selectorPorCondicion.mjs";
import { validarObjetoReserva } from "../../../sistema/reservas/validarObjetoReserva.mjs";
import { obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray } from "../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray.mjs";
import { Mutex } from "async-mutex";
import { utilidades } from "../../../componentes/utilidades.mjs";
export const preComprobarCodigoDescuento = async (entrada) => {
    const mutex = new Mutex()
    try {
        const tipoContenedorCodigo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoContenedorCodigo,
            nombreCampo: "El campo de tipoContenedorCodigo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const codigosDescuentoArray = []
        if (tipoContenedorCodigo === "cadena") {
            const codigoDescuentoB64 = validadoresCompartidos.tipos.cadena({
                string: entrada.body.codigoDescuento,
                nombreCampo: "No has escrito ningún codigo de descuento, recuerda que",
                filtro: "transformaABase64",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            codigosDescuentoArray.push(codigoDescuentoB64)
        } else if (tipoContenedorCodigo === "array") {
            const codigoDescuentoArrayAsci = validadoresCompartidos.tipos.array({
                array: entrada.body.codigoDescuento,
                nombreCampo: "El campo codigoDescuento",
                sePermitenDuplicados: "no"
            })

            codigoDescuentoArrayAsci.forEach((codigo) => {
                const codigoDescuentoB64 = validadoresCompartidos.tipos.cadena({
                    string: codigo,
                    nombreCampo: "No has escrito ningún codigo de descuento, recuerda que",
                    filtro: "transformaABase64",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

                codigosDescuentoArray.push(codigoDescuentoB64)
            })
        } else {
            const m = "El campo tipo contenedorCodigo solo espera cadena o array"
            throw new Error(error)
        }


        await utilidades.ralentizador(2000)
        mutex.acquire()

        const reserva = entrada.body.reserva;
        await validarObjetoReserva({
            reservaObjeto: reserva,
            filtroHabitacionesCamas: "no",
            filtroTitular: "no"
        })

        const apartamentosArray = Object.keys(reserva.alojamiento)
        const fechaEntradaReserva = reserva.fechaEntrada
        const fechaSalidaReserva = reserva.fechaSalida
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual = tiempoZH.toISODate();

        const ofertasActivas = await obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray({
            fechaActual: fechaActual,
            estadoIDV: "activado",
            zonasArray: ["global", "publica"],
            entidadIDV: "reserva",
            codigosDescuentoArray: codigosDescuentoArray
        })
        //Buscar en ofertas activas, publicas o globales, que tienen este codigo
        if (ofertasActivas.length === 0) {
            const m = "El codigo introducido no se reconoce 1"
            throw new Error(m)
        }

        const ofertaAnalizadasPorCondiciones = []
        const ofertasExistentesPeroConCondicionesQueNoSeCumplen = []
        // Comporbar si por condiciones la reserva entra en las ofertas encontradas
        for (const oferta of ofertasActivas) {
            const resultadoSelector = await selectorPorCondicion({
                // falta pasar pora qui los datos
                oferta,
                apartamentosArray: apartamentosArray,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntradaReserva,
                fechaSalida_reserva: fechaSalidaReserva,
                codigoDescuentosArrayBASE64: codigosDescuentoArray
            })
            resultadoSelector.autorizacion = "aceptada"
            const condicionesQueNoSeCumple = resultadoSelector.condicionesQueNoSeCumple
            if (condicionesQueNoSeCumple.length === 0) {
                ofertaAnalizadasPorCondiciones.push(resultadoSelector)
            } else {
                ofertasExistentesPeroConCondicionesQueNoSeCumplen.push(resultadoSelector)
            }
        }
        if (ofertasExistentesPeroConCondicionesQueNoSeCumplen.length > 0) {
            const ofertasNecesariasDeCondiciones = []
            for (const oferta of ofertasExistentesPeroConCondicionesQueNoSeCumplen) {
                const condicionesQueNoSeCumple = oferta.condicionesQueNoSeCumple
                if (condicionesQueNoSeCumple.includes("porCodigoDescuento")) {
                    continue
                } else {
                    ofertasNecesariasDeCondiciones.push(oferta)
                }
            }

            if (ofertasNecesariasDeCondiciones.length === 0) {
                const error = "No se reconoce el codigo 3"
                throw new Error(error)
            } else {
                const ok = {
                    error: "Tu código es válido, pero para acceder a esta oferta debes cumplir con las condiciones establecidas. Revisa las condiciones de la oferta para verificar si las cumples. Fíjate en el apartado 'Condiciones de la oferta'. En este apartado encontrarás las condiciones y una definición de las mismas.",
                    ofertas: ofertasExistentesPeroConCondicionesQueNoSeCumplen,
                }
                return ok
            }

        } else if (ofertaAnalizadasPorCondiciones.length > 0) {
            const ok = {
                ok: "El codigo de descuento es valido",
                ofertas: ofertaAnalizadasPorCondiciones,
            }
            return ok
        }
        return estructura
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }

}