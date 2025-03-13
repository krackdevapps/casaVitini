export const tablasAlojamiento = (data) => {
    try {
        const contenedorFinanciero = data.contenedorFinanciero
        const contenedor = []
        const totalesPorApartamento = contenedorFinanciero.desgloseFinanciero.entidades.reserva?.desglosePorApartamento || {}

        if (Object.entries(totalesPorApartamento).length > 0) {

            const tablaFormatoPDFMake = {
                style: 'tablaTotales',
                layout: 'lightHorizontalLines',
                table: {
                    widths: ['*', 100],
                    body: [
                        [
                            [
                                {
                                    text: 'Alojamiento',
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
            for (const [apartamentoIDV, contenedor] of Object.entries(totalesPorApartamento)) {
                const apartamentoUI = contenedor.apartamentoUI
                const totalNeto = contenedor.totalNeto
                const fila = [
                    [
                        {
                            text: apartamentoUI,
                            style: 'apartamentoNombre',
                        },
                    ],
                    [
                        {
                            text: totalNeto + '$',
                            style: 'valorTotal',
                        },
                    ],
                ]
                tablaFormatoPDFMake.table.body.push(fila)
            }
            contenedor.push(tablaFormatoPDFMake)
        }
        const complementosDeAlojamiento = contenedorFinanciero.desgloseFinanciero.entidades.complementosAlojamiento?.desglosePorComplementoDeAlojamiento || {}
        if (complementosDeAlojamiento.length > 0) {

            const contenedorServicio = {
                style: 'contenedorServicio',
                layout: 'lightHorizontalLines',
                table: {
                    widths: ['*', 300],
                    body: [
                        [
                            [
                                {
                                    text: 'Complementos de alojamiento',
                                    style: 'tituloColumnaIzquierda',
                                }
                            ],
                            [
                                {
                                    text: 'Total',
                                    style: 'tituloColumnaDerecha',
                                }
                            ]
                        ]
                    ]
                }
            }
            const complementosAlojamiento_comoObjeto = {}
            complementosDeAlojamiento.forEach(c => {
                const apartamentoIDV = c.apartamentoIDV
                const apartamentoUI = c.apartamentoUI
                if (!complementosAlojamiento_comoObjeto.hasOwnProperty(apartamentoIDV)) {
                    complementosAlojamiento_comoObjeto[apartamentoIDV] = {
                        apartamentoUI,
                        complementos: []
                    }
                }
                complementosAlojamiento_comoObjeto[apartamentoIDV].complementos.push(c)
            })


            for (const [apartamentoIDV, contenedor] of Object.entries(complementosAlojamiento_comoObjeto)) {

                const apartamentoUI = contenedor.apartamentoUI
                const complementos = contenedor.complementos

                const filaServicio = [
                    { text: apartamentoUI, style: 'nombreSimple' },
                    { text: "", style: 'valorTotal' }
                ];
                contenedorServicio.table.body.push(filaServicio);
                for (const c of complementos) {
                    const complementoUI = c.complementoUI
                    const precio = c.precio
                    const tipoPrecio = c.tipoPrecio
                    const noches = c.noches
                    const total = c.total
                    const habitacionUI = c?.habitacionUI
                    const tipoUbicacion = c.tipoUbicacion


                    let precioFinal
                    if (tipoPrecio === "fijoPorReserva") {
                        precioFinal = `Total: ${precio}$`
                    } else if (tipoPrecio === "porNoche") {
                        precioFinal = `${precio}$ por noche (${noches} noches). Total: ${total}$`

                    }

                    let nombreComplementoUI
                    if (tipoUbicacion === "habitacion") {
                        nombreComplementoUI = `${complementoUI} (${habitacionUI})`
                    } else if (tipoUbicacion === "alojamiento") {
                        nombreComplementoUI = `${complementoUI}`
                    }
                    const filaOpcion = [
                        { text: nombreComplementoUI, style: 'apartamentoNombre' },
                        { text: precioFinal, style: 'valorTotal' }
                    ];
                    contenedorServicio.table.body.push(filaOpcion);
                }
            }
            contenedor.push(contenedorServicio)
        }
        return contenedor
    } catch (error) {
        throw error
    }
}