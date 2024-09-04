import { DateTime } from "luxon"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
import { obtenerServicioPorCriterioPublicoPorServicioUIDArray } from "../../repositorio/servicios/obtenerServicioPorCriterioPublicoPorServicioUIDArray.mjs"
import { codigoZonaHoraria } from "../configuracion/codigoZonaHoraria.mjs"

export const validarServiciosPubicos = async (data) => {

  const serviciosUIDArray =  validadoresCompartidos.tipos.array({
        array: data,
        nombreCampo: "La llave de servicios",
        //filtro: "soloNumerosEnteros",
        sePermitenDuplicados: "no"
  })
    
  serviciosUIDArray.forEach((servicio, i) => {
        validadoresCompartidos.tipos.cadena({
            string: servicio,
            nombreCampo: `En la posicion ${i + 1} del array, se esperaba una cadena con un numero entero`,
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            impedirCero: "si",
            devuelveUnTipoNumber: "no",
            limpiezaEspaciosAlrededor: "si",
        })


    })
    const servicios = await obtenerServicioPorCriterioPublicoPorServicioUIDArray({
        zonaIDVArray: [
            "publica",
            "global"
        ],
        estadoIDV: "activado",
        serviciosUIDArray

    })
    const serviciosPublicos = []
    for (const servicio of servicios) {
        const contendor = servicio.contenedor
        const duracionIDV = contendor.duracionIDV
        const servicioUID = servicio.servicioUID
        if (duracionIDV === "rango") {
            const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
            const tiempoZH = DateTime.now().setZone(zonaHoraria);
            const fechaActual_ISO = tiempoZH.toISODate();

            const fechaInicio = contendor.fechaInicio
            const fechaFinal = contendor.fechaFinal

            const controlRango = await validadoresCompartidos.fechas.fechaEnRango({
                fechaAComprobrarDentroDelRango: fechaActual_ISO,
                fechaInicioRango_ISO: fechaInicio,
                fechaFinRango_ISO: fechaFinal
            })
            if (!controlRango) {
                continue
            }
        }
        serviciosPublicos.push(servicioUID)
    }
    return serviciosPublicos
}