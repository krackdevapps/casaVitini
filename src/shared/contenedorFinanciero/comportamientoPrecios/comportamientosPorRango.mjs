import { obtenerComportamientosPorCreacionPorFechaCracion } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorCreacionPorFechaCracion.mjs"
import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs"

export const comportamientosPorRango = async (data) => {
    const contenedorCompportamientos = []
    const comportamientosDePrecioPorRango = await obtenerComportamientosPorRangoPorTipoIDV({
        fechaInicio: data.fechaEntrada,
        fechaFinal: data.fechaSalida,
        tipoIDV: "porRango",
        arrayApartamentos: data.arrayApartamentos,
        estadoArray: ["activado"]
    })
    contenedorCompportamientos.push(...comportamientosDePrecioPorRango)
    const comportamientosDePrecioPorFechaCreacion = await obtenerComportamientosPorCreacionPorFechaCracion({
        fechaInicio: data.fechaEntrada,
        fechaFinal: data.fechaSalida,
        fechaCreacionReserva: data.fechaCreacionReserva,
        tipoIDV: "porCreacion",
        arrayApartamentos: data.arrayApartamentos,
        estado: "activado"
    })
    contenedorCompportamientos.push(...comportamientosDePrecioPorFechaCreacion)

    const comportamientosPorRangoFormateados = {}
    contenedorCompportamientos.forEach((comportamiento, i) => {
        const fechaInicio = comportamiento.fechaInicio
        const fechaFinal = comportamiento.fechaFinal
        const apartamentosDelComportamiento = comportamiento.contenedor.apartamentos

        apartamentosDelComportamiento.forEach((apartamento) => {
            const apartamentoIDV = apartamento.apartamentoIDV
            const simboloIDV = apartamento.simboloIDV
            const cantidad = apartamento.cantidad

            if (!comportamientosPorRangoFormateados.hasOwnProperty(apartamentoIDV)) {
                comportamientosPorRangoFormateados[apartamentoIDV] = []
            }
            const comportamiendoPorApartamento = {
                fechaInicio,
                fechaFinal,
                simboloIDV,
                cantidad
            }
            comportamientosPorRangoFormateados[apartamentoIDV].push(comportamiendoPorApartamento)
        })
    })
    return comportamientosPorRangoFormateados
}