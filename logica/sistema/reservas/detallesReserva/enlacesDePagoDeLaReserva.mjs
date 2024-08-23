import { obtenerEnlaceDePagoPorReservaUID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorReservaUID.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { controlCaducidadEnlacesDePago } from "../../enlacesDePago/controlCaducidadEnlacesDePago.mjs";

export const enlacesDePagoDeLaReserva = async (reservaUID) => {
    try {

        await controlCaducidadEnlacesDePago();
        const enlacesDePagoDeLaReserva = await obtenerEnlaceDePagoPorReservaUID(reservaUID)
        const ok = []
        for (const detallesEnlace of enlacesDePagoDeLaReserva) {
            console.log("detalles", detallesEnlace)
            const nombreEnlace = detallesEnlace.nombreEnlace;
            const enlaceUID = detallesEnlace.enlaceUID;
            const reservaUID = detallesEnlace.reservaUID;
            const codigo = detallesEnlace.codigo;
            const estadoPagoIDV = detallesEnlace.estadoPagoIDV;
            const cantidad = detallesEnlace.cantidad;
            const descripcion = detallesEnlace.descripcion;

            const contenedorFinanciero = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
            const totalFinal = contenedorFinanciero.desgloseFinanciero.global.totales.totalFinal
            const precio = totalFinal ? totalFinal : "Reserva sin total"

            const estructuraFinal = {
                enlaceUID,
                nombreEnlace,
                reservaUID,
                estadoPagoIDV,
                descripcion,
                enlace: codigo,
                cantidad,
                totalReserva: precio,
            };
            ok.push(estructuraFinal);
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}