export const tablasImpuestos = (data) => {

    try {


        const contenedorFinanciero = data.contenedorFinanciero
        const c = []

        const impuestos = contenedorFinanciero.desgloseFinanciero.impuestos
        if (impuestos.length > 0) {
            const tablaFormatoPDFMake = {
                style: 'tablaTotales',
                layout: 'lightHorizontalLines',
                table: {
                    widths: ['*', 100],
                    body: [
                        [
                            [
                                {
                                    text: 'Impuesto',
                                    style: 'tituloColumnaIzquierda',
                                }
                            ],
                            [
                                {
                                    text: 'Total',
                                    style: 'tituloColumnaDerecha',
                                }
                            ]
                        ],
                    ]
                }
            }
            for (const detallesImpuesto of impuestos) {
                const nombre = detallesImpuesto.nombre
                const tipoImpositivo = detallesImpuesto.tipoImpositivo
                const tipoValor = detallesImpuesto.tipoValorIDV
                const porcentaje = detallesImpuesto.porcentaje
                let valorFinal
                if (tipoValor === "tasa") {
                    valorFinal = tipoImpositivo + "$"
                }
                if (tipoValor === "porcentaje") {
                    valorFinal = `(${porcentaje}%) ${tipoImpositivo}$`
                }
                const fila = [
                    [
                        {
                            text: nombre,
                            style: 'apartamentoNombre',
                        },
                    ],
                    [
                        {
                            text: valorFinal,
                            style: 'valorTotal',
                        },
                    ],
                ]
                tablaFormatoPDFMake.table.body.push(fila)
            }
            c.push(tablaFormatoPDFMake)
        }


        return c
    } catch (error) {
        throw error
    }
}