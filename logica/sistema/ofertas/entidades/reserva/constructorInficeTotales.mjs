export const constructorIndiceTotales = (data) => {
    try {
        const desglosePorApartamento = data.entidades.reserva.desglosePorApartamento
        const desglosePorNoche = data.entidades.reserva.desglosePorNoche
        const indicePorApartamentos = {}
        const indicePorNoche = {}

        desglosePorApartamento.forEach((totalPorApartamento, posicion) => {
            const apartamentoIDV = totalPorApartamento.apartamentoIDV
            indicePorApartamentos[apartamentoIDV] = { posicion }
        });
        desglosePorNoche.forEach((detallesPorNoche, posicion) => {

            const fechaDiaConNoche = detallesPorNoche.fechaDiaConNoche
            const apartamentosPorNoche = detallesPorNoche.apartamentosPorNoche
            const estructuraIndiceNoche = {
                posicion,
                apartamentosPorNoche: {}
            }

            const indiceApartamentos = estructuraIndiceNoche.apartamentosPorNoche
            apartamentosPorNoche.forEach((totalDelApartamento, posicion) => {
                const apartamentoIDV = totalDelApartamento.apartamentoIDV
                indiceApartamentos[apartamentoIDV] = { posicion }
            })
            indicePorNoche[fechaDiaConNoche] = estructuraIndiceNoche
        })

        const indiceTotalesBase = {
            indicePorApartamentos,
            indicePorNoche
        }
        return indiceTotalesBase
    } catch (error) {
        throw error
    }
}