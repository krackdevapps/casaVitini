import Decimal from 'decimal.js';
Decimal.set({ precision: 1000 });
export const constructorDesglosePorApartamento = async (data) => {
    try {
        const estructuraDesglosePorApartamento = data.estructuraDesglosePorApartamento
        const diasArray = data.diasArray
        const estructuraTotales = []
        for (const [apartamentoIDV, totalPorApartamento] of Object.entries(estructuraDesglosePorApartamento)) {
            const precioMedioNetoNocheRango = new Decimal(totalPorApartamento).dividedBy(diasArray.length)
            const estructura = {
                apartamentoIDV: apartamentoIDV,
                totalNeto: totalPorApartamento.toFixed(2),
                precioMedioNetoNoche: precioMedioNetoNocheRango.toFixed(2),
            }
            estructuraTotales.push(estructura)
        }
        return estructuraTotales
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
