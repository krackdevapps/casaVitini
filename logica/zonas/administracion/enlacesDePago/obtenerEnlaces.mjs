import { obtenerTodosEnlaceDePago } from "../../../repositorio/enlacesDePago/obtenerTodosLosEnlaceDePago.mjs";
import { obtenerDesgloseFinancieroPorReservaUID } from "../../../repositorio/reservas/transacciones/desgloseFinanciero/obtenerDesgloseFinancieroPorReservaUID.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs";


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
            const totalesReserva = await obtenerDesgloseFinancieroPorReservaUID(reservaUID)
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

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}