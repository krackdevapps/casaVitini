import { actualizarReembolsoPorPagoUIDPorReembolsoUIDPasarela } from "../../../repositorio/reservas/transacciones/actualizarReembolsoPorPagoUIDPorReembolsoUIDPasarela.mjs";
import { insertarReembolso } from "../../../repositorio/reservas/transacciones/insertarReembolso.mjs";
import { obtenerReembolsosPorPagoUIDPorReembolsoUIDPasarela } from "../../../repositorio/reservas/transacciones/obtenerReembolsosPorPagoUIDPorReembolsoUIDPasarela.mjs";
import { utilidades } from "../../utilidades.mjs";
import { detallesDelPago } from "./detallesDelPago.mjs";
import { detallesDelReembolso } from "./detallesDelReembolso.mjs";

export const actualizarReembolsosDelPagoDesdeSquare = async (pagoUID, pagoUIDPasarela) => {
    try {
        const plataformaDePago = "pasarela";
        const detallesDelPagoSquare = await detallesDelPago(pagoUIDPasarela);
        if (detallesDelPagoSquare.error) {
            const error = `La pasarela no ha respondido con los detalles del pago actualizados al requerir ${pagoUIDPasarela} a la pasarela, esto son datos de la copia no actualizada en casa vitini`;
            throw new Error(error);
        }
        const identificadoresRembolsosDeEstaTransacion = detallesDelPagoSquare?.refundIds;
        for (const reembolsoUIDPasarela of identificadoresRembolsosDeEstaTransacion) {
            const detallesDelReembolsoOL = await detallesDelReembolso(reembolsoUIDPasarela);
            if (detallesDelReembolsoOL.error) {
                const error = `La pasarela no ha respondido con los detalles del reembolso ${reembolsoUIDPasarela} actualizados, esto son datos de la copia no actualizada en casa vitini`;
                throw new Error(error);
            }
            const estadoReembolso = detallesDelReembolsoOL.status;
            const cantidad = utilidades.deFormatoSquareAFormatoSQL(detallesDelReembolsoOL.amountMoney.amount);
            const creacionUTC = detallesDelReembolsoOL.createdAt;
            const actualizacionUTC = detallesDelReembolsoOL.updatedAt;

            const reembolsoPorPagoUIDPorReembolsoUIDPasarela = await obtenerReembolsosPorPagoUIDPorReembolsoUIDPasarela({
                pagoUID: pagoUID,
                reembolsoUIDPasarela: reembolsoUIDPasarela
            })
            if (reembolsoPorPagoUIDPorReembolsoUIDPasarela.length === 0) {               
                await insertarReembolso({
                    pagoUID: pagoUID,
                    cantidad: cantidad,
                    plataformaDePago: plataformaDePago,
                    reembolsoUIDPasarela: reembolsoUIDPasarela,
                    estadoReembolso: estadoReembolso,
                    fechaCreacion: creacionUTC,
                    fechaActualizacion: actualizacionUTC,
                })
            }
            if (reembolsoPorPagoUIDPorReembolsoUIDPasarela.length === 1) {
                await actualizarReembolsoPorPagoUIDPorReembolsoUIDPasarela({
                    pagoUID: pagoUID,
                    cantidad: cantidad,
                    plataformaDePago: plataformaDePago,
                    reembolsoUIDPasarela: reembolsoUIDPasarela,
                    estadoReembolso: estadoReembolso,
                    fechaCreacion: creacionUTC,
                    fechaActualizacion: actualizacionUTC,
                })
            }
        }
    } catch (errorCapturado) {
        return errorCapturado;
    }
}