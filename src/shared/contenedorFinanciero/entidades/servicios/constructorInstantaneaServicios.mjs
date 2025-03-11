import Decimal from 'decimal.js';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const constructorInstantaneaServicios = async (data) => {
    try {
        const estructura = data.estructura
        const servicios = data.servicios
        const opcionesSolicitadasDelservicio = data.opcionesSolicitadasDelservicio || {}

        const contenedorEntidades = estructura.entidades

        if (!contenedorEntidades.hasOwnProperty("servicios")) {
            contenedorEntidades.servicios = {}
        }
        const serviciosEntidad = contenedorEntidades.servicios
        if (!serviciosEntidad.hasOwnProperty("global")) {
            serviciosEntidad.global = {}
        }
        const global = serviciosEntidad.global
        global.totales = {
            totalSinDescuentosAplicados: new Decimal("0.00"),
            descuentoAplicados: new Decimal("0.00"),
            totalConDescuentoAplicados: new Decimal("0.00"),
            impuestosAplicados: "0.00",
            totalNeto: new Decimal("0.00"),
            totalFinal: new Decimal("0.00")
        }
        const globalTotales = global.totales
        if (!serviciosEntidad.hasOwnProperty("desglosePorServicios")) {
            serviciosEntidad.desglosePorServicios = []
        }
        const desglosePorServicios = serviciosEntidad.desglosePorServicios

        for (const servicio of servicios) {

            const servicioUID = servicio.servicioUID
            delete servicio.testingVI
            const contenedor = servicio.contenedor
            const gruposDeOpciones = contenedor.gruposDeOpciones
            delete servicio.opcionesSel
            const servicioSoliciado_objeto = opcionesSolicitadasDelservicio[servicioUID]
            const opcionesDelServicioSolicitadas = servicioSoliciado_objeto.opcionesSeleccionadas
            const descuentoTotalServicio = servicio.descuentoTotalServicio

            const totalesDelServicio = {}
            let totalServicio = new Decimal(0)

            for (const [grupoIDV, grupoServicioSolicitado] of Object.entries(opcionesDelServicioSolicitadas)) {

                totalesDelServicio[grupoIDV] = {}
                const opcionesDelGrupo = gruposDeOpciones[grupoIDV].opcionesGrupo || []
                opcionesDelGrupo.forEach(o => {
                    const opcionIDV = o.opcionIDV
                    const opcionIDVValida = grupoServicioSolicitado.some(g => g.opcionIDV === opcionIDV);
                    if (opcionIDVValida) {

                        const precioOpcion = o.precioOpcion
                        const precioDeLaOpcion = precioOpcion.length === 0 || !precioOpcion ? 0.00 : precioOpcion
                        const interruptorCantidad = o?.interruptorCantidad

                        totalesDelServicio[grupoIDV][opcionIDV] = {
                            precioUnidad: null,
                            cantidad: "1",
                            precioConCantidad: null,
                            descuentoAplicado: "0.00",
                            tipoDescuento: null,
                            precioConDescuento: null,
                            total: null
                        }
                        const tds = totalesDelServicio[grupoIDV][opcionIDV]
                        let precioNetoOpcionDelServicio

                        const opcionSel = grupoServicioSolicitado.find(g => g.opcionIDV === opcionIDV);
                        const tipoDescuento = opcionSel.tipoDescuento
                        const cantidadDescuento = opcionSel?.cantidadDescuento

                        if (interruptorCantidad === "activado") {
                            const cantidad = opcionSel.cantidad
                            o.cantidad = cantidad
                            precioNetoOpcionDelServicio = new Decimal(precioDeLaOpcion).mul(cantidad)
                        } else {
                            precioNetoOpcionDelServicio = new Decimal(precioDeLaOpcion)
                        }

                        tds.precioUnidad = precioDeLaOpcion
                        tds.precioConCantidad = precioNetoOpcionDelServicio.toFixed(2)
                        tds.precioConDescuento = precioNetoOpcionDelServicio.toFixed(2)
                        tds.total = precioNetoOpcionDelServicio.toFixed(2)
                        tds.tipoDescuento = tipoDescuento

                        if (tipoDescuento === "cantidad") {
                            const descuentoAplicado = new Decimal(precioNetoOpcionDelServicio).minus(cantidadDescuento)
                            tds.descuentoAplicado = Number(cantidadDescuento).toFixed(2)
                            tds.precioConDescuento = descuentoAplicado.toFixed(2)
                            tds.total = descuentoAplicado.toFixed(2)
                            globalTotales.descuentoAplicados = globalTotales.descuentoAplicados.plus(cantidadDescuento)


                        } else if (tipoDescuento === "porcentaje") {
                            const diferenciaPorcentaje = new Decimal(precioNetoOpcionDelServicio).times(cantidadDescuento).dividedBy(100);
                            const descuentoAplicado = new Decimal(precioNetoOpcionDelServicio).minus(diferenciaPorcentaje)

                            tds.descuentoAplicado = diferenciaPorcentaje.toFixed(2)
                            tds.precioConDescuento = descuentoAplicado.toFixed(2)
                            tds.total = descuentoAplicado.toFixed(2)
                            globalTotales.descuentoAplicados = globalTotales.descuentoAplicados.plus(diferenciaPorcentaje)

                        }
                        const totalOpcionServicio = tds.total
                        totalServicio = totalServicio.plus(totalOpcionServicio)
                    }
                })
            }

            const tipoDescuentoTotalPorServicio = descuentoTotalServicio?.tipoDescuento || null
            const cantidadTotalPorServicio = descuentoTotalServicio?.cantidadDescuento || 0

            const desgloseDelServicio = {
                servicio,
                opcionesSolicitadasDelservicio: servicioSoliciado_objeto,
                totalesDelSerivicio: {
                    global: {
                        totalGruposServicio: Number(totalServicio).toFixed(2),
                        descuentoAplicadoAlServicio: "0.00",
                        tipoDescuentoAplicadoAlServicio: tipoDescuentoTotalPorServicio,
                        totalServicioConDescuentosAplicados: Number(totalServicio).toFixed(2),
                        totalServicio: Number(totalServicio).toFixed(2),
                    },
                    porGruposDeOpciones: totalesDelServicio
                }
            }

            const degloseServicio = desgloseDelServicio.totalesDelSerivicio.global

            if (tipoDescuentoTotalPorServicio === "cantidad") {
                const descuentoAplicado = new Decimal(totalServicio).minus(cantidadTotalPorServicio)

                degloseServicio.descuentoAplicadoAlServicio = Number(cantidadTotalPorServicio).toFixed(2)
                degloseServicio.totalServicioConDescuentosAplicados = descuentoAplicado.toFixed(2)
                degloseServicio.totalServicio = descuentoAplicado.toFixed(2)

                globalTotales.descuentoAplicados = globalTotales.descuentoAplicados.plus(cantidadTotalPorServicio)

            } else if (tipoDescuentoTotalPorServicio === "porcentaje") {
                const diferenciaPorcentaje = new Decimal(totalServicio).times(cantidadTotalPorServicio).dividedBy(100);
                const descuentoAplicado = new Decimal(cantidadTotalPorServicio).minus(diferenciaPorcentaje)

                degloseServicio.descuentoAplicadoAlServicio = diferenciaPorcentaje.toFixed(2)
                degloseServicio.totalServicioConDescuentosAplicados = descuentoAplicado.toFixed(2)
                degloseServicio.totalServicio = descuentoAplicado.toFixed(2)
                globalTotales.descuentoAplicados = globalTotales.descuentoAplicados.plus(diferenciaPorcentaje)

            }
            desglosePorServicios.push(desgloseDelServicio)
            globalTotales.totalSinDescuentosAplicados = globalTotales.totalSinDescuentosAplicados.plus(desgloseDelServicio.totalesDelSerivicio.global.totalGruposServicio)
            globalTotales.totalConDescuentoAplicados = globalTotales.totalConDescuentoAplicados.plus(desgloseDelServicio.totalesDelSerivicio.global.totalServicioConDescuentosAplicados)
            globalTotales.totalNeto = globalTotales.totalNeto.plus(desgloseDelServicio.totalesDelSerivicio.global.totalServicio)

        }
        globalTotales.totalSinDescuentosAplicados = globalTotales.totalSinDescuentosAplicados.toFixed(2)
        globalTotales.descuentoAplicados = globalTotales.descuentoAplicados.toFixed(2)
        globalTotales.totalConDescuentoAplicados = globalTotales.totalConDescuentoAplicados.toFixed(2)
        globalTotales.totalNeto = globalTotales.totalNeto.toFixed(2)
        globalTotales.totalFinal = globalTotales.totalNeto
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
