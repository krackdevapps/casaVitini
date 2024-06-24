import { DateTime } from "luxon"
import { obtenerApartamentosDeLaOfertaPorOfertaUID } from '../../repositorio/ofertas/obtenerApartamentosDeLaOfertaPorOfertaUID.mjs';
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";

const fusionaArrayConComaYUltimaConYGriega = (array) => {
    return array.length <= 1 ? array.join("") : `${array.slice(0, -1).join(", ")} y ${array.slice(-1)}`;
}

export const selectorOfertasPorCondiciones = async (ofertasEncontradasPorFecha) => {
    try {
        const ofertasSeleccionadasPorCondiciones = []
        for (const detalleOferta of ofertasEncontradasPorFecha) {
            const tipoOferta = detalleOferta.tipoOferta
            if (tipoOferta === "porNumeroDeApartamentos") {
                const simboloNumero = detalleOferta.simboloNumero
                const numero = detalleOferta.numero
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaEstructuraFinal = {
                    nombreOferta: nombreOferta,
                    tipoDescuento: tipoDescuento,
                    tipoOferta: tipoOferta,
                    cantidad: cantidad
                }
                if (simboloNumero === "aPartirDe" && numero <= numeroApartamentos) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} o mas apartamentos`
                    ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                }
                if (simboloNumero === "numeroExacto" && numero === numeroApartamentos) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} apartamentos`
                    ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                }
            }
            if (tipoOferta === "porDiasDeAntelacion") {
                const simboloNumero = detalleOferta.simboloNumero
                const numero = detalleOferta.numero
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaEstructuraFinal = {
                    nombreOferta: nombreOferta,
                    tipoDescuento: tipoDescuento,
                    tipoOferta: tipoOferta,
                    cantidad: cantidad
                }
                // Calcula la diferencia en milisegundos
                const fechaEntrada_Objeto = DateTime.fromISO(fechaEntradaReserva_ISO, { zone: codigoZonaHoraria.zonaHoraria });
                const diasAntelacion = Math.floor(fechaEntrada_Objeto.diff(tiempoZH, 'days').days);
                if (simboloNumero === "aPartirDe" && numero <= diasAntelacion) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de antelacion o mas `
                    ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                }
                if (simboloNumero === "numeroExacto" && numero === diasAntelacion) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de antelacion concretamente`
                    ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                }
            }
            if (tipoOferta === "porDiasDeReserva") {
                const simboloNumero = detalleOferta.simboloNumero
                const numero = detalleOferta.numero
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaEstructuraFinal = {
                    nombreOferta: nombreOferta,
                    tipoDescuento: tipoDescuento,
                    tipoOferta: tipoOferta,
                    cantidad: cantidad
                }
                const fechaEntradaReservaObjeto = DateTime.fromISO(fechaEntradaReserva_ISO);
                const fechaSalidaReservaObjeto = DateTime.fromISO(fechaSalidaReserva_ISO);
                const diasDeLaReserva = Math.floor(fechaSalidaReservaObjeto.diff(fechaEntradaReservaObjeto, 'days').days);
                if (simboloNumero === "aPartirDe" && numero <= diasDeLaReserva) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de duracion o mas`
                    ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                }
                if (simboloNumero === "numeroExacto" && numero === diasDeLaReserva) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de duracion concretamente`
                    ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                }
            }
            if (tipoOferta === "porApartamentosEspecificos") {
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaUID = detalleOferta.uid
                const descuentoAplicadoA = detalleOferta.descuentoAplicadoA
                const apartamentosDedicadosOferta = []

                const apartamentosDeLaOferta = await obtenerApartamentosDeLaOfertaPorOfertaUID(ofertaUID)
                const apartamentosIDVOferta = []
                const apartamentosUIOferta = []
                for (const detallesApartamentoDedicado of apartamentosDeLaOferta) {
                    const apartamentoIDV = detallesApartamentoDedicado.apartamentoIDV
                    const apartamentoUI = await validadoresCompartidos.reservas.resolverNombreApartamento(apartamentoIDV)
                    const tipoDescuento = detallesApartamentoDedicado.tipoDescuento
                    const cantidad = detallesApartamentoDedicado.cantidad
                    const estructura = {
                        apartamentoIDV: apartamentoIDV,
                        apartamentoUI: apartamentoUI,
                        tipoDescuento: tipoDescuento,
                        cantidad: cantidad,
                    }
                    apartamentosDedicadosOferta.push(estructura)
                    apartamentosIDVOferta.push(apartamentoIDV)
                    apartamentosUIOferta.push(apartamentoUI)
                }
                const compararArraysStrings = (array1, array2) => {
                    return array2.every(item => array1.includes(item));
                };
                const resultadoDeLaCompracion = compararArraysStrings(apartamentosIDV, apartamentosIDVOferta);
                if (resultadoDeLaCompracion) {
                    const ofertaEstructuraFinal = {
                        nombreOferta: nombreOferta,
                        tipoOferta: tipoOferta,
                    }
                    ofertaEstructuraFinal.descuentoAplicadoA = descuentoAplicadoA
                    if (descuentoAplicadoA === "totalNetoReserva") {
                        ofertaEstructuraFinal.tipoDescuento = tipoDescuento
                        ofertaEstructuraFinal.cantidad = cantidad
                        const formateoApartamentos =  fusionaArrayConComaYUltimaConYGriega(apartamentosUIOferta);
                        let definicionUI
                        if (apartamentosUIOferta.length > 1) {
                            definicionUI = `Oferta aplicada al neto de la reserva por contener los apartamentos: ${formateoApartamentos}`
                        }
                        if (apartamentosUIOferta.length === 1) {
                            definicionUI = `Oferta aplicada al neto de la reserva por contener el apartamento: ${formateoApartamentos}`
                        }
                        ofertaEstructuraFinal.definicion = definicionUI
                        ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                    }
                    if (descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                        ofertaEstructuraFinal.definicion = `Oferta aplicada con descuentos indivudales por apartamento. Estos descuentos se aplican al neto de cada apartamamento por separado`
                        const arrayApartamentos = []
                        for (const detalleApartamento of apartamentosDedicadosOferta) {
                            const apartamentoIDV = detalleApartamento.apartamentoIDV
                            const apartamentoUI = detalleApartamento.apartamentoUI
                            const tipoDescuentoApartamento = detalleApartamento.tipoDescuento
                            const cantidadApartamento = detalleApartamento.cantidad
                            let esquemaApartamento = {
                                apartamentoIDV: apartamentoIDV,
                                apartamentoUI: apartamentoUI,
                                tipoDescuento: tipoDescuentoApartamento,
                                cantidad: cantidadApartamento
                            }
                            arrayApartamentos.push(esquemaApartamento)
                        }
                        ofertaEstructuraFinal.apartamentos = arrayApartamentos
                        ofertasSeleccionadasPorCondiciones.push(ofertaEstructuraFinal)
                    }
                }
            }
        }
        return ofertasSeleccionadasPorCondiciones
    } catch (errorCapturado) {
        throw errorCapturado
    }
}