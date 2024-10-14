import Decimal from 'decimal.js';
const precisionDecimal = Number(process.env.PRECISION_DECIMAL)
Decimal.set({ precision: precisionDecimal });
export const constructorInstantaneaServicios = async (data) => {
    try {
        const estructura = data.estructura
        const servicios = data.servicios
        const opcionesSolicitadasDelservicios = data.opcionesSolicitadasDelservicios || {}

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
            totalNeto: new Decimal("0.00"),
            totalDescuento: "0.00",
            totalFinal: "0.00",
            impuestosAplicados: "0.00"
        }
        if (!serviciosEntidad.hasOwnProperty("desglosePorServicios")) {
            serviciosEntidad.desglosePorServicios = []
        }
        const desglosePorServicios = serviciosEntidad.desglosePorServicios

        for (const servicio of servicios) {
            const servicioUID = servicio.servicioUID
            delete servicio.testingVI
            const contenedor = servicio.contenedor
            const gruposDeOpciones = contenedor.gruposDeOpciones


            const servicioSoliciado_objeto = opcionesSolicitadasDelservicios[servicioUID]


            const opcionesDelServicioSolicitadas = servicioSoliciado_objeto.opcionesSeleccionadas

            for (const [grupoIDV, grupoServicioSolicitado] of Object.entries(opcionesDelServicioSolicitadas)) {

                const opcionesDelGrupo = gruposDeOpciones[grupoIDV].opcionesGrupo || []


                const opcionesSeleccionadaConPrecio = opcionesDelGrupo.filter(o => grupoServicioSolicitado.includes(o.opcionIDV) && o.precioOpcion.length > 0)


                opcionesSeleccionadaConPrecio.forEach(o => {

                    const precioDeLaOpcione = o.precioOpcion
                    const precioNetoServicio = new Decimal(precioDeLaOpcione)
                    global.totales.totalNeto = precioNetoServicio.plus(global.totales.totalNeto)
                })
                if (opcionesSeleccionadaConPrecio.length > 0) {

                    desglosePorServicios.push({
                        servicio,
                        opcionesSolicitadasDelservicios: servicioSoliciado_objeto
                    })
                }
            }
        }
        global.totales.totalNeto = global.totales.totalNeto.toFixed(2)
        global.totales.totalFinal = global.totales.totalNeto

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
