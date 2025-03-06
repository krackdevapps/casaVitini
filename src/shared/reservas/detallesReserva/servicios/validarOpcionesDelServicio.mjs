import { DateTime } from "luxon"
import { codigoZonaHoraria } from "../../../configuracion/codigoZonaHoraria.mjs"
import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { utilidades } from "../../../utilidades.mjs"

export const validarOpcionesDelServicio = async (data) => {
    try {
        const opcionesSeleccionadasDelServicio = data.opcionesSeleccionadasDelServicio || {}
        const servicioExistenteAccesible = data.servicioExistenteAccesible
        const contendor = servicioExistenteAccesible.contenedor
        const tituloPublico = contendor.tituloPublico
        const duracionIDV = contendor.duracionIDV

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
                const m = `El servicio esta fuera del rango. Hoy estamos a ${fechaActual_ISO} y el servicio tiene un rango que empiezz el ${fechaInicio} y acaba el ${fechaFinal}`
                throw new Error(m)
            }
        }

        const opcionesSeleccionadasPorValidar = opcionesSeleccionadasDelServicio.opcionesSeleccionadas
        const gruposDeOpcionesDelServicio = servicioExistenteAccesible.contenedor.gruposDeOpciones
        for (const [grupoIDV, grupoDeOpciones] of Object.entries(gruposDeOpcionesDelServicio)) {

            // Servicio DB
            const configuracionGrupo = grupoDeOpciones.configuracionGrupo
            const nombreGrupo = grupoDeOpciones.nombreGrupo
            const opcionesGrupo = grupoDeOpciones.opcionesGrupo
            const confSelObligatoria = configuracionGrupo.confSelObligatoria
            const confSelNumero = configuracionGrupo.confSelNumero

            // Servicio a comprorbar
            const grupoPorValidar = opcionesSeleccionadasPorValidar ?? {}
            if (Object.keys(grupoPorValidar).length === 0) {
                const m = `En el servicio ${tituloPublico}, selecione al menos una opción. No ha seleccionado nada.`
                throw new Error(m)
            }

            // Comporbra si es obligatorio
            if (confSelObligatoria.includes("unaObligatoria")) {
                if (!grupoPorValidar.hasOwnProperty(grupoIDV)) {
                    const m = `El servicio ${tituloPublico}, en las opciones de selección ${nombreGrupo}, no esta definido el obligatorio y esperado ${grupoIDV}.`
                    throw new Error(m)
                }

                if (grupoPorValidar[grupoIDV].length === 0) {
                    const m = `El servicio ${tituloPublico}, en las opciones de selección ${nombreGrupo}, se requiere seleccionar al menos una opción, gracias.`
                    throw new Error(m)
                }
            }

            if (confSelNumero.includes("maximoUnaOpcion") && grupoPorValidar[grupoIDV].length > 1) {
                const m = `El servicio ${tituloPublico}, en las opciones de selección ${nombreGrupo}, solo se permite maximo una opcion seleccionada`
                throw new Error(m)
            }


            const opcionesIDV = opcionesGrupo.map(o => o.opcionIDV);
            // idv del servicio

            const opcionesIDVNoReconocidos = grupoPorValidar[grupoIDV].filter(o => {
                const oIDV = o.opcionIDV
                return !opcionesIDV.includes(oIDV)
            });
            if (opcionesIDVNoReconocidos.length > 0) {

                const opcionesIDV = opcionesIDVNoReconocidos.map(o => o.opcionIDV)
                const constructo = utilidades.constructorComasEY({
                    array: opcionesIDV,
                    articulo: ""
                })
                const m = `El servicio ${tituloPublico}, en las opciones de selección ${nombreGrupo}, no se recononen los identificadores de opcionIDV: ${constructo}`
                throw new Error(m)
            }


            for (const o of opcionesGrupo) {
                const estadoInterruptorCantidad = o.interruptorCantidad
                const opcionIDV = o.opcionIDV
                const nombreOpcion = o.nombreOpcion

                const gpv = grupoPorValidar[grupoIDV].find(gPV => gPV.opcionIDV === opcionIDV)
                if (!gpv) {
                    continue
                }

                if (estadoInterruptorCantidad === "activado") {
                    const controlCantidad = gpv?.cantidad || null
                    if (controlCantidad === null) {
                        const m = `El servicio ${tituloPublico}, en las opciones de selección ${nombreGrupo}, en la opcion ${nombreOpcion} (${opcionIDV}) se esperaba una llave cantidad definida`
                        throw new Error(m)
                    }
                } else {
                    gpv.cantidad = "1"
                }

            }
        }
    } catch (error) {
        throw error
    }

}