import { utilidades } from "../../../componentes/utilidades.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const detallesDelEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo enlaceUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await controlCaducidadEnlacesDePago();
        const enlaceDePago = obtenerEnlaceDePagoPorEnlaceUID(enlaceUID)

        const nombreEnlace = enlaceDePago.nombreEnlace;
        const codigo = enlaceDePago.codigo;
        const descripcion = enlaceDePago.descripcion;
        const reserva = enlaceDePago.reserva;
        const fechaCaducidad_ISO = enlaceDePago.fechaCaducidad_ISO;
        const caducidad = enlaceDePago.caducidad;
        const caducidadUTC = utilidades.convertirFechaUTCaHumano(caducidad);
        const caducidadMadrid = utilidades.deUTCaZonaHoraria(caducidad, "Europe/Madrid");
        const caducidadNicaragua = utilidades.deUTCaZonaHoraria(caducidad, "America/Managua");

        const detallesReserva = await obtenerReservaPorReservaUID(reserva)
        const estadoPago = detallesReserva.estadoPago;
        const ok = {
            ok: {
                enlaceUID: enlaceUID,
                nombreEnlace: nombreEnlace,
                codigo: codigo,
                reserva: reserva,
                fechaCaducidad_ISO: fechaCaducidad_ISO,
                estadoPago: estadoPago,
                caducidadUTC: caducidadUTC,
                caducidadMadrid: caducidadMadrid,
                caducidadNicaragua: caducidadNicaragua
            }
        }
        salida.json(ok)
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}