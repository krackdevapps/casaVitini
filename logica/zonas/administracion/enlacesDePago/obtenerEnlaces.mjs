import { obtenerTodosEnlaceDePago } from "../../../repositorio/enlacesDePago/obtenerTodosLosEnlaceDePago.mjs";
import { obtenerTotalesReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerTotalesReservaPorReservaUID.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const obtenerEnlaces = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await controlCaducidadEnlacesDePago();
        const enlacesDePago = await obtenerTodosEnlaceDePago()

        const ok = {
            ok: []
        };
        for (const detallesEnlace of enlacesDePago) {
            const nombreEnlace = detallesEnlace.nombreEnlace;
            const enlaceUID = detallesEnlace.enlaceUID;
            const reservaUID = detallesEnlace.reserva;
            const codigo = detallesEnlace.codigo;
            const estadoPago = detallesEnlace.estadoPago;
            const cantidad = detallesEnlace.cantidad;
            const descripcion = detallesEnlace.descripcion;
            const totalIDV = "totalConImpuestos";
            const totalesReserva = await obtenerTotalesReservaPorReservaUID(reservaUID)
            const totalDeLaReservaConImpuestos = totalesReserva.totalConImpuestos
            const precio = totalDeLaReservaConImpuestos ? totalDeLaReservaConImpuestos : "Reserva sin total"

            const estructuraFinal = {
                enlaceUID: enlaceUID,
                nombreEnlace: nombreEnlace,
                reservaUID: reservaUID,
                estadoPago: estadoPago,
                descripcion: descripcion,
                enlace: codigo,
                cantidad: cantidad,
                totalReserva: precio,
            };
            ok.ok.push(estructuraFinal);
        }

        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}