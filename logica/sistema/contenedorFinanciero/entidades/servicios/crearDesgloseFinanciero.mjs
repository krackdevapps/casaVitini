import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs";
import { constructorInstantaneaServicios } from "./constructorInstantaneaServicios.mjs";


export const crearDesgloseFinanciero = async (data) => {
    try {
        const estructura = data.estructura
        const serviciosSolicitados = data.serviciosSolicitados

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaActual = DateTime.now().setZone(zonaHoraria).toISODate()
        await constructorInstantaneaServicios({
            estructura,
            serviciosSolicitados
        })
     
    } catch (error) {
        throw error
    }
}