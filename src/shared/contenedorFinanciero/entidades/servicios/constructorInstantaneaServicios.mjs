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

            const servicioSoliciado_objeto = opcionesSolicitadasDelservicio[servicioUID]
            const opcionesDelServicioSolicitadas = servicioSoliciado_objeto.opcionesSeleccionadas

            for (const [grupoIDV, grupoServicioSolicitado] of Object.entries(opcionesDelServicioSolicitadas)) {
                const opcionesDelGrupo = gruposDeOpciones[grupoIDV].opcionesGrupo || []
                opcionesDelGrupo.forEach(o => {
                    const opcionIDV = o.opcionIDV
                    if (grupoServicioSolicitado.includes(opcionIDV)) {
                        const precioDeLaOpcion = o.precioOpcion.length === 0 ? 0.00 : o.precioOpcion
                        const precioNetoServicio = new Decimal(precioDeLaOpcion)
                        global.totales.totalNeto = precioNetoServicio.plus(global.totales.totalNeto)
                    }        
                })
                desglosePorServicios.push({
                    servicio,
                    opcionesSolicitadasDelservicio: servicioSoliciado_objeto
                })
            }
        }
        global.totales.totalNeto = global.totales.totalNeto.toFixed(2)
        global.totales.totalFinal = global.totales.totalNeto
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
