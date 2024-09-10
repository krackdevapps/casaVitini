import { utilidades } from "../../../componentes/utilidades.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerEnlaceDePagoPorEnlaceUID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorEnlaceUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";

export const detallesDelEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
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
            devuelveUnTipoNumber: "si"
        })

        await controlCaducidadEnlacesDePago();
        const enlaceDePago = await obtenerEnlaceDePagoPorEnlaceUID(enlaceUID)

        const nombreEnlace = enlaceDePago.nombreEnlace;
        const codigo = enlaceDePago.codigo;
        const descripcion = enlaceDePago.descripcion;
        const reservaUID = enlaceDePago.reservaUID;
        const fechaCaducidad = enlaceDePago.fechaCaducidad;
        // const caducidadUTC = utilidades.conversor.fecha_ISO_hacia_humana(fechaCaducidad);
        // const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        // const caducidadMadrid = utilidades.deUTCaZonaHoraria(fechaCaducidad, "Europe/Madrid");
        // const caducidadNicaragua = utilidades.deUTCaZonaHoraria(fechaCaducidad, zonaHoraria);

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
                // caducidadUTC: caducidadUTC,
                // caducidadMadrid: caducidadMadrid,
                // caducidadNicaragua: caducidadNicaragua
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}