import { utilidades } from "../../../shared/utilidades.mjs";

import { controlCaducidadEnlacesDePago } from "../../../shared/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { codigoZonaHoraria } from "../../../shared/configuracion/codigoZonaHoraria.mjs";

export const detallesDelEnlace = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo enlaceUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        await controlCaducidadEnlacesDePago();
        const enlaceDePago = await obtenerEnlaceDePagoPorEnlaceUID(enlaceUID)

        const nombreEnlace = enlaceDePago.nombreEnlace;
        const codigo = enlaceDePago.codigo;
        const descripcion = enlaceDePago.descripcion;
        const reservaUID = enlaceDePago.reservaUID;
        const fechaCaducidad = enlaceDePago.fechaCaducidad;





        const detallesReserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoPago = detallesReserva.estadoPagoIDV;
        const ok = {
            ok: {
                enlaceUID: enlaceUID,
                nombreEnlace: nombreEnlace,
                codigo: codigo,
                reservaUID: reservaUID,
                fechaCaducidad_ISO: fechaCaducidad,
                estadoPago: estadoPago,



            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}