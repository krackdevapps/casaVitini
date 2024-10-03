import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { selectorPorCondicion } from "../../../shared/ofertas/entidades/reserva/selectorPorCondicion.mjs";
import { obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray } from "../../../infraestructure/repository/ofertas/perfiles/obtenerOfertasPorRangoActualPorEstadoPorCodigoDescuentoArray.mjs";
import { Mutex } from "async-mutex";
import { utilidades } from "../../../shared/utilidades.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { validarObjetoReservaPublica } from "../../../shared/reservas/nuevaReserva/reservaPulica/validarObjetoReservaPublica.mjs";
import { disponibilidadApartamentos } from "../../../shared/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs";
export const preComprobarCodigoDescuento = async (entrada) => {
    const mutex = new Mutex()
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })










        const codigosDescuentoArray = []











        const codigoDescuentoArrayAsci = validadoresCompartidos.tipos.array({
            array: entrada.body?.codigoDescuento,
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
                soloMinusculas: "si"
            })
            codigosDescuentoArray.push(codigoDescuentoB64)
        })





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


        if (ofertasActivas.length === 0) {
            const m = "El código introducido no se reconoce"
            throw new Error(m)
        }

        const ofertaAnalizadasPorCondiciones = []
        const ofertasExistentesPeroConCondicionesQueNoSeCumplen = []

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
            const numeroCodigos = codigosDescuentoArray.length
            let m
            if (numeroCodigos === 1) {
                m = "El codigo introducido no correponde a ninguna oferta"
            } else {
                m = "Los codigos introducidos no correponden a ninguna oferta"
            }
            throw new Error(m)
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