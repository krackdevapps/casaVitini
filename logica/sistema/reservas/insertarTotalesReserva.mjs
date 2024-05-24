import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { actualizarEstadoPago } from '../precios/actualizarEstadoPago.mjs';
import { precioReserva } from '../precios/precioReserva.mjs';
import { eliminarTotalesPorNochePorReservaUID } from '../../repositorio/reservas/transacciones/totales/eliminarTotalesPorNochePorReservaUID.mjs';
import { insertarTotalPorNohce } from '../../repositorio/reservas/transacciones/totales/insertarTotalPorNohce.mjs';
import { eliminarTotalesPorApartamentoPorReservaUID } from '../../repositorio/reservas/transacciones/totales/eliminarTotalesPorApartamentoPorReservaUID.mjs';
import { insertarTotalPorApartamento } from '../../repositorio/reservas/transacciones/totales/insertarTotalPorApartamento.mjs';
import { eliminarImpuestosReservaUID } from '../../repositorio/reservas/transacciones/impuestos/eliminarImpuestosReservaUID.mjs';
import { insertarImpuestoEnReserva } from '../../repositorio/reservas/transacciones/impuestos/insertarImpuestoEnReserva.mjs';
import { eliminarOfertasPorReservaUID } from '../../repositorio/reservas/transacciones/ofertas/eliminarOfertasPorReservaUID.mjs';
import { insertarOfertaEnReserva } from '../../repositorio/reservas/transacciones/ofertas/insertarOfertaEnReserva.mjs';
import { eliminarTotalesPorReservaUID } from '../../repositorio/reservas/transacciones/totales/eliminarTotalesPorReservaUID.mjs';
import { insertarTotalEnReserva } from '../../repositorio/reservas/transacciones/totales/insertarTotalEnReserva.mjs';
import { obtenerReservaPorReservaUID } from '../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs';
import { campoDeTransaccion } from '../../repositorio/globales/campoDeTransaccion.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
export const insertarTotalesReserva = async (metadatos) => {
    try {
        const tipoProcesadorPrecio = metadatos.tipoProcesadorPrecio
        const reserva = metadatos.reserva
        const reservaUID = metadatos.reservaUID
        if (tipoProcesadorPrecio !== "objeto" && tipoProcesadorPrecio !== "uid") {
            const error = "El tipo de procesador de precio solo puede ser objeto o uid"
            throw new Error(error)
        }
        const transaccion = {
            tipoProcesadorPrecio: tipoProcesadorPrecio
        }
        if (tipoProcesadorPrecio === "objeto") {
            transaccion.reserva = reserva
        }
        if (tipoProcesadorPrecio === "uid") {
            transaccion.reserva = reservaUID
            const detallesReserva = await obtenerReservaPorReservaUID(reservaUID)
            const estadoReserva = detallesReserva.estadoReserva
            if (estadoReserva === "cancelada") {
                const error = "No se puede generar o volver a generar datos financieros de de una reserva cancelada"
                throw new Error(error)
            }
        }
        await campoDeTransaccion("iniciar")
        const resolverPrecio = await precioReserva(transaccion)
        const desgloseFinanciero = resolverPrecio.ok.desgloseFinanciero
        const totalesPorNoche = desgloseFinanciero.totalesPorNoche
        const detallePorApartamento = desgloseFinanciero.totalesPorApartamento
        const impuestos = desgloseFinanciero.impuestos
        const ofertas = desgloseFinanciero.ofertas
        const totales = desgloseFinanciero.totales
        await eliminarTotalesPorNochePorReservaUID(reservaUID)
        let reservaTotalesPorNocheUID
        for (const detallesDelDiaConNoche of totalesPorNoche) {
            const fechaDiaConNoche_Humana = detallesDelDiaConNoche.fechaDiaConNoche
            const fechaDiaConNoche_array = fechaDiaConNoche_Humana.split("/")
            const fechaDia = fechaDiaConNoche_array[0].padStart(2, "0")
            const fechaMes = fechaDiaConNoche_array[1].padStart(2, "0")
            const fechaAno = fechaDiaConNoche_array[2]
            const fechaDiaConNoche_ISO = `${fechaAno}-${fechaMes}-${fechaDia}`
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaDiaConNoche_ISO,
                nombreCampo: "La fecha con noche"
            })

            const precioNetoNoche = detallesDelDiaConNoche.precioNetoNoche
            const apartamentosJSON = detallesDelDiaConNoche.apartamentosJSON

            await insertarTotalPorNohce({
                reservaUID: reservaUID,
                apartamentosJSON: apartamentosJSON,
                precioNetoNoche: precioNetoNoche,
                fechaDiaConNoche_ISO: fechaDiaConNoche_ISO
            })

        }
        await eliminarTotalesPorApartamentoPorReservaUID(reservaUID)
        for (const detallesDelApartamentomo of detallePorApartamento) {
            const apartamentoIDV = detallesDelApartamentomo.apartamentoIDV
            const totalNetoRango = detallesDelApartamentomo.totalNetoRango
            const precioMedioNocheRango = detallesDelApartamentomo.precioMedioNocheRango
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV(apartamentoIDV)

            await insertarTotalPorApartamento({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                totalNetoRango: totalNetoRango,
                precioMedioNocheRango: precioMedioNocheRango
            })
        }
        await eliminarImpuestosReservaUID(reservaUID)
        for (const impuesto of impuestos) {
            const impuestoNombre = impuesto.nombreImpuesto
            const tipoImpositivo = impuesto.tipoImpositivo
            const tipoValor = impuesto.tipoValor
            const calculoImpuestoPorcentaje = impuesto.calculoImpuestoPorcentaje ? impuesto.calculoImpuestoPorcentaje : null

            await insertarImpuestoEnReserva({
                reservaUID: reservaUID,
                impuestoNombre: impuestoNombre,
                tipoImpositivo: tipoImpositivo,
                tipoValor: tipoValor,
                calculoImpuestoPorcentaje: calculoImpuestoPorcentaje
            })
        }
        await eliminarOfertasPorReservaUID(reservaUID)
        const insertarOferta = async (oferta) => {
            try {

                const nombreOferta = oferta.nombreOferta
                const tipoOferta = oferta.tipoOferta
                const detallesOferta = oferta.detallesOferta

                const tipoDescuento = oferta.tipoDescuento
                const cantidad = oferta.cantidad || null
                const descuentoAplicadoA = oferta.descuentoAplicadoA
                const definicion = oferta.definicion
                const descuento = oferta.descuento || null

                await insertarOfertaEnReserva({
                    reservaUID: reservaUID,
                    nombreOferta: nombreOferta,
                    tipoOferta: tipoOferta,
                    definicion: definicion,
                    detallesOferta: JSON.stringify(detallesOferta),
                    detallesOferta: descuento || null,
                    tipoDescuento: tipoDescuento,
                    cantidad: Number(cantidad) || null,
                    descuentoAplicadoA: descuentoAplicadoA
                })

            } catch (errorCapturado) {
                throw errorCapturado
            }
        }

        for (const contenedorOfertas of ofertas) {
            const porNumeroDeApartamentos = contenedorOfertas.porNumeroDeApartamentos
            const porDiasDeReserva = contenedorOfertas.porDiasDeReserva
            const porDiasDeAntelacion = contenedorOfertas.porDiasDeAntelacion
            const porRangoDeFechas = contenedorOfertas.porRangoDeFechas
            const porApartamentosEspecificos = contenedorOfertas.porApartamentosEspecificos
            if (porNumeroDeApartamentos?.length) {
                for (const detallesOferta of porNumeroDeApartamentos) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porDiasDeReserva?.length) {
                for (const detallesOferta of porDiasDeReserva) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const numero = detallesOferta.numero
                    const simboloNumero = detallesOferta.simboloNumero
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        numero: numero,
                        simboloNumero: simboloNumero,
                        definicion: definicion,
                        descuento: descuento
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porDiasDeAntelacion?.length) {
                for (const detallesOferta of porDiasDeAntelacion) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porRangoDeFechas?.length) {
                for (const detallesOferta of porRangoDeFechas) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const diasAfectados = detallesOferta.diasAfectados
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento,
                        detallesOferta: diasAfectados
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porApartamentosEspecificos?.length) {
                for (const detallesOferta of porApartamentosEspecificos) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const descuentoAplicadoA = detallesOferta.descuentoAplicadoA
                    const apartamentosEspecificos = detallesOferta.apartamentosEspecificos
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento,
                        descuentoAplicadoA: descuentoAplicadoA,
                        detallesOferta: apartamentosEspecificos
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
        }
        await eliminarTotalesPorReservaUID(reservaUID)
        const promedioNetoPorNoche = totales.promedioNetoPorNoche
        const totalReservaNetoSinOfertas = totales.totalReservaNetoSinOfertas
        const totalReservaNeto = totales.totalReservaNeto
        const totalDescuentos = totales.totalDescuentos
        const totalImpuestos = totales.totalImpuestos
        const totalConImpuestos = totales.totalConImpuestos
        //95 string string string string string
        typeof promedioNetoPorNoche,
            typeof totalReservaNetoSinOfertas,
            typeof totalReservaNeto,
            typeof totalDescuentos,
            typeof totalImpuestos,
            typeof totalConImpuestos
        //El error esta en que los totales mira como biene
        //10 object string string string string
        await insertarTotalEnReserva({
            promedioNetoPorNoche: promedioNetoPorNoche,
            totalReservaNetoSinOfertas: totalReservaNetoSinOfertas,
            totalReservaNeto: totalReservaNeto,
            totalDescuentos: totalDescuentos,
            totalImpuestos: totalImpuestos,
            totalConImpuestos: totalConImpuestos,
            reservaUID: reservaUID
        })
        await actualizarEstadoPago(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "datos financieros generados correctamente en esta reserva"
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw error;
    }
}
