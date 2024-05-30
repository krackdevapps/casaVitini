export const aplicarDescuento = (data) => {
    try {
        const ofertarParaAplicarDescuentos = data.ofertarParaAplicarDescuentos
        const totalesBase = data.totalesBase

        for (const oferta of ofertarParaAplicarDescuentos) {
            const descuentos = oferta.oferta.descuentosJSON
            /*
                descuentosJSON: {
                  tipoDescuento: 'totalNeto',
                  descuentoTotal: '10.00',
                  tipoAplicacion: 'porcentaje'
                }
            */
            const tipoDescuento = descuentos.tipoDescuento
            if (tipoDescuento === "totalNeto") {
                const descuentoTotal = descuentos.descuentoTotal
                const tipoAplicacion = descuentos.tipoAplicacion
                const totales = totalesBase.totales
                const totalesNeto = totales.totalesNeto
                const totalFinal = totales.totalFinal

                console.log("descuentos", descuentos)
            } else if (tipoDescuento === "porRango") {
                const descuentoTotal = descuentos.descuentoTotal
                const tipoAplicacion = descuentos.tipoAplicacion
                const totales = totalesBase.totales
                const totalesNeto = totales.totalesNeto
                const totalFinal = totales.totalFinal

                console.log("descuentos", descuentos)
            } else if (tipoDescuento === "individualPorApartamento") {
                const descuentoTotal = descuentos.descuentoTotal
                const tipoAplicacion = descuentos.tipoAplicacion
                const totales = totalesBase.totales
                const totalesNeto = totales.totalesNeto
                const totalFinal = totales.totalFinal

                console.log("descuentos", descuentos)
            }


        }
    } catch (error) {
        throw error
    }
}