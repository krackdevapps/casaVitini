import { obtenerComportamientosPorDiasTipoIDV } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientosPorDiasPorTipoIDV.mjs"

export const comportamientosPorDias = async (data) => {
    const comportamientosDePrecioPorRango = await obtenerComportamientosPorDiasTipoIDV({
        nombreDiasAgrupados: data.nombreDiasAgrupados,
        arrayApartamentos: data.arrayApartamentos
    })

    const comportamientosPorRangoFormateados = {}
    comportamientosDePrecioPorRango.forEach((comportamiento, i) => {
        const apartamentosDelComportamiento = comportamiento.contenedor.apartamentos
        const dias = comportamiento.contenedor.dias

        apartamentosDelComportamiento.forEach((apartamento) => {
            const apartamentoIDV = apartamento.apartamentoIDV
            const simboloIDV = apartamento.simboloIDV
            const cantidad = apartamento.cantidad

            if (!comportamientosPorRangoFormateados.hasOwnProperty(apartamentoIDV)) {
                comportamientosPorRangoFormateados[apartamentoIDV] = []
            }
            const comportamiendoPorApartamento = {
                dias,
                simboloIDV,
                cantidad
            }
            comportamientosPorRangoFormateados[apartamentoIDV].push(comportamiendoPorApartamento)
        })
    })

    return comportamientosPorRangoFormateados
}