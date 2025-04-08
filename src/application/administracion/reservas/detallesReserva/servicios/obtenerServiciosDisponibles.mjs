import { DateTime } from "luxon";
import { obtenerTodosLosServicioDisponiblesParaInsertarEnReserva } from "../../../../../infraestructure/repository/servicios/obtenerTodosLosServicioDisponiblesParaInsertarEnReserva.mjs";
import { codigoZonaHoraria } from "../../../../../shared/configuracion/codigoZonaHoraria.mjs";


export const obtenerServiciosDisponibles = async (entrada) => {
    try {


        const servicios = await obtenerTodosLosServicioDisponiblesParaInsertarEnReserva({
            zonaIDVArray: ["privada", "global"],
            estadoIDV: "activado"
        })


        const ok = {
            ok: "Aquí tienes los servicios disponiles para insertar en la reserva, solo se muestran servicis en zona privada y global con estado activado",
            servicios
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}