import { obtenerImpuestosPorReservaUID } from "../../../repositorio/reservas/transacciones/impuestos/obtenerImpuestosPorReservaUID.mjs";
import { obtenerOfertasPorReservaUID } from "../../../repositorio/reservas/transacciones/ofertas/obtenerOfertasPorReservaUID.mjs";
import { obtenerTotalesGlobal } from "../../../repositorio/reservas/transacciones/totales/obtenerTotalesGlobal.mjs";
import { obtenerTotalesPorApartamentoPorReservaUID } from "../../../repositorio/reservas/transacciones/totales/obtenerTotalesPorApartamentoPorReservaUID.mjs";
import { obtenerTotalesPorNochePorReservaUID } from "../../../repositorio/reservas/transacciones/totales/obtenerTotalesPorNochePorReservaUID.mjs";

export const desgloseTotal = async (reservaUID) => {
    const desgloseFinanciero = {
        totalesPorNoche: [],
        totalesPorApartamento: [],
        ofertas: [],
        impuestos: [],
        totales: []
    }

    const totalesPorNoches = await obtenerTotalesPorNochePorReservaUID(reservaUID)
    if (totalesPorNoches.length === 0) {
        desgloseFinanciero.totalesPorNoche = []
    } else {
        desgloseFinanciero.totalesPorNoche = totalesPorNoches
    }

    const totalesPorApartmento = await obtenerTotalesPorApartamentoPorReservaUID(reservaUID)
    if (totalesPorApartmento.length === 0) {
        desgloseFinanciero.totalesPorApartamento = []
    } else {
        desgloseFinanciero.totalesPorApartamento = totalesPorApartmento
    }

    const ofertasAplicadas = await obtenerOfertasPorReservaUID(reservaUID)
    if (ofertasAplicadas.length > 0) {
        const contenedorTipoOferta = {}
        for (const oferta of ofertasAplicadas) {
            const tipoOferta = oferta.tipoOferta
            if (!contenedorTipoOferta[tipoOferta]) {
                contenedorTipoOferta[tipoOferta] = []
            }
            if (tipoOferta === "porApartamentosEspecificos") {
                if (oferta.descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                    delete oferta.tipoDescuento
                    delete oferta.cantidad
                }
                oferta.apartamentosEspecificos = oferta.detallesOferta
                delete oferta.detallesOferta
            }
            if (tipoOferta === "porRangoDeFechas") {
                oferta.diasAfectados = oferta.detallesOferta
                delete oferta.detallesOferta
            }
            contenedorTipoOferta[tipoOferta].push(oferta)
        }
        const contenedorFinalFormateado = []
        for (const contenedor of Object.entries(contenedorTipoOferta)) {
            const tipoOferta = contenedor[0]
            const contenedorOfertas = contenedor[1]
            const estructuraContenedor = {}
            estructuraContenedor[tipoOferta] = contenedorOfertas
            contenedorFinalFormateado.push(estructuraContenedor)
        }
        desgloseFinanciero.ofertas = contenedorFinalFormateado
    }

    const impuestosAplicados = await obtenerImpuestosPorReservaUID(reservaUID)
    if (impuestosAplicados.length === 0) {
        desgloseFinanciero.impuestos = []
    } else {
        desgloseFinanciero.impuestos = impuestosAplicados
    }
    const totalesDeLaReserva = await obtenerTotalesGlobal(reservaUID)
    if (totalesDeLaReserva.length === 0) {
        desgloseFinanciero.totales = []
    } else {
        desgloseFinanciero.totales = totalesDeLaReserva
    }
    return reserva
};
