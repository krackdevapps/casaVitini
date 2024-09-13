import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { selectorPorCondicion } from "../../../sistema/ofertas/entidades/reserva/selectorPorCondicion.mjs";
import { obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray } from "../../../repositorio/ofertas/perfiles/obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray.mjs";
import { Mutex } from "async-mutex";
import { utilidades } from "../../../componentes/utilidades.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { validarObjetoReservaPublica } from "../../../sistema/reservas/nuevaReserva/reservaPulica/validarObjetoReservaPublica.mjs";
import { disponibilidadApartamentos } from "../../../sistema/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs";
export const preComprobarCodigoDescuento = async (entrada) => {
    const mutex = new Mutex()
    try {

        // Sscript obsoletizable
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
                nombreCampo: "No has escrito ningún código de descuento, recuerda que",
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
                    nombreCampo: "No has escrito ningún código de descuento, recuerda que",
                    filtro: "transformaABase64",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

                codigosDescuentoArray.push(codigoDescuentoB64)
            })
        } else {
            const m = "El campo tipo contenedorCodigo solo espera cadena o array"
            throw new Error(m)
        }

        await utilidades.ralentizador(2000)
        mutex.acquire()

        const reservaPublica = entrada.body.reserva;
        await validarObjetoReservaPublica({
            reservaPublica: reservaPublica,
            filtroHabitacionesCamas: "desactivado",
            filtroTitular: "desactivado"
        })

        const apartamentosArray = Object.keys(reservaPublica.alojamiento)
        const fechaEntradaReserva = reservaPublica.fechaEntrada
        const fechaSalidaReserva = reservaPublica.fechaSalida
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual = tiempoZH.toISODate();

        const fechaEntrada = reservaPublica.fechaEntrada
        const fechaSalida = reservaPublica.fechaSalida
        const apartamentosIDVArray = Object.keys(reservaPublica.alojamiento)

        await disponibilidadApartamentos({
            fechaEntrada,
            fechaSalida,
            apartamentosIDVArray
        })

        const ofertasActivas = await obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray({
            fechaActual: fechaActual,
            estadoIDV: "activado",
            zonasArray: ["global", "publica"],
            entidadIDV: "reserva",
            codigosDescuentoArray: codigosDescuentoArray
        })
        const ok = {}

        //Buscar en ofertas activas, publicas o globales, que tienen este codigo
        if (ofertasActivas.length === 0) {
            const m = "El código introducido no se reconoce"
            throw new Error(m)
        }

        const ofertaAnalizadasPorCondiciones = []
        const ofertasExistentesPeroConCondicionesQueNoSeCumplen = []
        // Comporbar si por condiciones la reserva entra en las ofertas encontradas
        for (const oferta of ofertasActivas) {

            const condicionesDeLaOferta = oferta.condicionesArray
            let ofertaSinCodigoDescuento = "si"
            condicionesDeLaOferta.forEach((contenedor) => {
                const tipoCondicion = contenedor.tipoCondicion
                if (tipoCondicion === "porCodigoDescuento") {
                    ofertaSinCodigoDescuento = "no"
                }
            })
            if (ofertaSinCodigoDescuento === "si") {
                continue
            }

            const resultadoSelector = await selectorPorCondicion({
                // falta pasar pora qui los datos
                oferta,
                apartamentosArray: apartamentosArray,
                fechaActual_reserva: fechaActual,
                fechaEntrada_reserva: fechaEntradaReserva,
                fechaSalida_reserva: fechaSalidaReserva,
                codigoDescuentosArrayBASE64: codigosDescuentoArray,
                ignorarCodigosDescuentos: "no"
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
                const error = "No se reconoce el codigo"
                throw new Error(error)
            } else {
                ok.error = "Tu código es válido, pero para acceder a esta oferta debes cumplir con las condiciones establecidas. Revisa las condiciones de la oferta para verificar si las cumples. Fíjate en el apartado 'Condiciones de la oferta'. En este apartado encontrarás las condiciones y una definición de las mismas."
                ok.ofertas = ofertasExistentesPeroConCondicionesQueNoSeCumplen

            }

        } else if (ofertaAnalizadasPorCondiciones.length > 0) {
            ok.ok = "El código de descuento es válido"
            ok.ofertas = ofertaAnalizadasPorCondiciones

            for (const contenedorOferta of ofertaAnalizadasPorCondiciones) {
                const descuentosPorApartamentos = contenedorOferta?.oferta?.descuentosJSON?.apartamentos || []
                for (const contenedorApartamento of descuentosPorApartamentos) {
                    const apartamentoIDV = contenedorApartamento.apartamentoIDV
                    const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "noExiste"
                    })).apartamentoUI
                    contenedorApartamento.apartamentoUI = apartamentoUI
                }

                // Descuentos por dias con apartamentos especificos
                const descuentosPorDiasConApartamentos = contenedorOferta?.oferta?.descuentosJSON?.descuentoPorDias || []
                for (const contenedorDia of descuentosPorDiasConApartamentos) {

                    const contenedorApartametnos = contenedorDia?.apartamentos || []
                    for (const contenedorApartamento of contenedorApartametnos) {
                        const apartamentoIDV = contenedorApartamento.apartamentoIDV
                        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                            apartamentoIDV,
                            errorSi: "noExiste"
                        })).apartamentoUI
                        contenedorApartamento.apartamentoUI = apartamentoUI
                    }
                }
            }
        } else {
            ok.ok = "No se han encontrado ofertas con ese codigo de descuento"
            ok.ofertas = []
        }
    
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }

}