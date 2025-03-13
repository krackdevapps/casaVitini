export const tablasTotales = (data) => {


    try {


        const contenedorFinanciero = data.contenedorFinanciero
        const c = []
        const totales = contenedorFinanciero.desgloseFinanciero.global.totales
        const objetoTraductor = {
            totalNeto: "Total reserva neto",
            totalFinal: "Total final a pagar",
            totalDescuentos: "Total suma descuentos aplicados",
            promedioNocheNeto: "Promedio neto por noche ponderado",
            impuestosAplicados: "Total impuestos aplicados",
            totalNetoConDescuentos: "Total neto con descuentos aplicados",
            promedioNocheNetoConDescuentos: "Promedio noche neto con descuentos",
        }

        const tablaTotales = {
            style: 'tablaTotales',
            layout: 'lightHorizontalLines',
            table: {
                widths: ['*', 100],
                body: [
                    [
                        [
                            {
                                text: 'Definición de los totales',
                                style: 'tituloColumnaIzquierda',
                            }
                        ],
                        [
                            {
                                text: 'Valor del total',
                                style: 'tituloColumnaDerecha',
                            }
                        ]
                    ],
                ]
            }
        }

        for (const [nombreTotal, valorTotal] of Object.entries(totales)) {
            const nombreTotalUI = objetoTraductor[nombreTotal]
            const fila = [
                [
                    {
                        text: nombreTotalUI,
                        style: 'apartamentoNombre',
                    },
                ],
                [
                    {
                        text: valorTotal + "$",
                        style: 'valorTotal',
                    },
                ],
            ]
            tablaTotales.table.body.push(fila)
        }
        c.push(tablaTotales)


        return c
    } catch (error) {
        throw error
    }
}