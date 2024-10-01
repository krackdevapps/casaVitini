export const estructuraDesgloseFinanciero = () => {
    try {
        const estructura = {
            global: {
                totales: {
                    totalNeto: "0.00",
                    totalFinal: "0.00"
                },
            },
            entidades: {}
        }
        return estructura
    } catch (errorCapturado) {
        throw errorCapturado
    }







}