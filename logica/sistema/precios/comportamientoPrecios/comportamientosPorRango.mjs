import { obtenerComportamientosPorRangoPorTipoIDV } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs"

export const comportamientosPorRango = async (data) => {
    const comportamientosDePrecioPorRango = await obtenerComportamientosPorRangoPorTipoIDV({
        fechaEntrada_ISO: data.fechaEntrada_ISO,
        fechaSalida_ISO: data.fechaSalida_ISO,
        tipoIDV: "porRango",
        arrayApartamentos: data.arrayApartamentos,
        estado: "activado"
    })
    const comportamientosPorRangoFormateados = {}
    comportamientosDePrecioPorRango.forEach((comportamiento, i) => {
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