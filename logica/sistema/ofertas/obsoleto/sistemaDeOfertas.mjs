import { porApartamentosEspecificos } from "./perfiles/porApartamentosEspecificos.mjs"
import { porNumeroDeApartamentos } from "./perfiles/porNumeroDeApartamentos.mjs"
import { porDiasDeReserva } from "./perfiles/porDiasDeReserva.mjs"
import { porRangoDeFechas } from './perfiles/porRangoDeFechas.mjs'
import { porDiasDeAntelacion } from './perfiles/porDiasDeAntelacion.mjs'
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"
import Decimal from "decimal.js"
import { DateTime } from "luxon"

export const sistemaDeOfertas = async (reserva) => {

    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
    let fechaActualTZ

    if (reserva.fechas.creacion_ISO_UTC) {
        fechaActualTZ = DateTime.fromISO(reserva.fechas.creacion_ISO_UTC).setZone(zonaHoraria).toISODate();
    } else {
        fechaActualTZ = DateTime.now().setZone(zonaHoraria).toISODate();
    }

    reserva.fechas.fechaActualProcesada_ISO = fechaActualTZ
    const contenedorOferta = []
    let descuentoTotal = new Decimal(0)
    const ofertasPorNumeroDeApartamentos = await porNumeroDeApartamentos(reserva)
    contenedorOferta.push(ofertasPorNumeroDeApartamentos)
    const ofertasPorApartamentosEspecificos = await porApartamentosEspecificos(reserva)
    contenedorOferta.push(ofertasPorApartamentosEspecificos)
    const ofertasPorDiasDeReserva = await porDiasDeReserva(reserva)
    contenedorOferta.push(ofertasPorDiasDeReserva)
    const ofertasPorRangoDeFecha = await porRangoDeFechas(reserva)
    contenedorOferta.push(ofertasPorRangoDeFecha)
    const ofertasPorDiasDeAntelacion = await porDiasDeAntelacion(reserva)
    contenedorOferta.push(ofertasPorDiasDeAntelacion)

    
    //Sumar el total
    for (const detallesOferta of contenedorOferta) {
        const totalOferta = detallesOferta.descuentoGlobal
        descuentoTotal = descuentoTotal.plus(totalOferta)
        delete detallesOferta.descuentoGlobal
    }
    const descuentoFinal = descuentoTotal.isPositive() ? descuentoTotal : "0.00"
    const estructura = {
        ofertas: contenedorOferta,
        descuentoFinal: descuentoFinal
    }
    return estructura

};
