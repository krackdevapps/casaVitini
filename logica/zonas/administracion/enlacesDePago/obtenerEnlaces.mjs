import { obtenerTodosEnlaceDePago } from "../../../repositorio/enlacesDePago/obtenerTodosLosEnlaceDePago.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs";

export const obtenerEnlaces = async (entrada,) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        await controlCaducidadEnlacesDePago();
        const enlacesDePago = await obtenerTodosEnlaceDePago()

        const ok = {
            ok: []
        };
        for (const detallesEnlace of enlacesDePago) {
            console.log("detalleSenlace", detallesEnlace)
            const nombreEnlace = detallesEnlace.nombreEnlace;
            const enlaceUID = detallesEnlace.enlaceUID;
            const reservaUID = detallesEnlace.reservaUID;
            const codigo = detallesEnlace.codigo;
            const estadoPago = detallesEnlace.estadoPago;
            const cantidad = detallesEnlace.cantidad;
            const descripcion = detallesEnlace.descripcion;

            const contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
            const totalFinal = contenedorFinanciero.desgloseFinanciero.global.totales.totalFinal
            const precio = totalFinal ? totalFinal : "Reserva sin total"

            const estructuraFinal = {
                enlaceUID,
                nombreEnlace,
                reservaUID,
                estadoPago,
                descripcion,
                enlace: codigo,
                cantidad,
                totalReserva: precio,
            };
            ok.ok.push(estructuraFinal);
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}