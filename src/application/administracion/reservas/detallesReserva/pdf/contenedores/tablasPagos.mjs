export const tablasPagos = (data) => {


    try {
        const detallesPagos = data.detallesPagos
        const configuracionPorTabla = data?.configuracionPorTabla || {}
        const contnenedorUID = configuracionPorTabla?.contnenedorUID || []
        const incluirTotales = configuracionPorTabla?.incluirTotales || "no"

        const c = []

        const totalReembolsado = detallesPagos.totalReembolsado
        const porcentajeReembolsado = detallesPagos.porcentajeReembolsado
        const porcentajePagado = detallesPagos.porcentajePagado
        const totalReserva = detallesPagos.totalReserva
        const totalPagado = detallesPagos.totalPagado
        const faltantePorPagar = detallesPagos.faltantePorPagar

        const pagos = detallesPagos.pagos

        const tablaPorPAgo = {
            style: 'tablaTotales',
            layout: 'lightHorizontalLines',
            table: {
                widths: ['*', 100],
                body: [
                    [
                        [
                            {
                                text: 'Desglose por pago',
                                style: 'tituloColumnaIzquierda',
                            }
                        ],
                        [
                            {
                                text: 'Cantidad',
                                style: 'tituloColumnaDerecha',
                            }
                        ]
                    ],
                ]
            }
        }

        for (const p of pagos) {

            const pagoUID = p.pagoUID
            const plataformaDePagoIDV = p.plataformaDePagoIDV
            const tarjetaDigitos = p.tarjetaDigitos
            const pagoUIDPasarela = p.pagoUIDPasarela
            const reservaUID = p.reservaUID
            const tarjeta = p.tarjeta
            const cantidad = p.cantidad
            const fechaPago = p.fechaPago
            const pagadorNombre = p.pagadorNombre
            const pagadorPasaporte = p.pagadorPasaporte
            const chequeUID = p.chequeUID
            const transferenciaUID = p.transferenciaUID
            const conceptoPagoB64 = p.conceptoPago
            const fechaPagoLocal = p.fechaPagoLocal
            const buffer = Buffer.from(conceptoPagoB64, 'base64');

            if (contnenedorUID.length > 0 && !contnenedorUID.includes(pagoUID)) {

                continue
            }

            const conceptoPago = buffer.toString('utf-8');

            const plataformaDePagoDICT = {
                pasarela: "Pasarela",
                efectivo: "Efectivo",
                cheque: "Cheque",
                tarjeta: "Tarjeta"
            }

            const fila = [
                [
                    {
                        text: `${conceptoPago}\n(${fechaPagoLocal}) ${plataformaDePagoDICT[plataformaDePagoIDV]}`,
                        style: 'apartamentoNombre',
                    },
                ],
                [
                    {
                        text: cantidad + "$",
                        style: 'valorTotal',
                    },
                ],
            ]
            tablaPorPAgo.table.body.push(fila)
        }
        c.push(tablaPorPAgo)


        const dictTotales = {
            totalReembolsado: "Total reembolsado",
            porcentajeReembolsado: "Porcentaje reembolsado",
            porcentajePagado: "Portentaje pagado",
            totalPagado: "Total pagado",
            faltantePorPagar: "Faltante por pagar"
        }

        const tablaTotalesPagos = {
            style: 'tablaTotales',
            layout: 'lightHorizontalLines',
            table: {
                widths: ['*', 100],
                body: [
                    [
                        [
                            {
                                text: 'Pagos totales',
                                style: 'tituloColumnaIzquierda',
                            }
                        ],
                        [
                            {
                                text: '',
                                style: 'tituloColumnaDerecha',
                            }
                        ]
                    ],
                ]
            }
        }

        Object.entries(dictTotales).forEach(p => {
            const [dIDV, dUI] = p
            const data = detallesPagos[dIDV]

            const fila = [
                [
                    {
                        text: dUI,
                        style: 'apartamentoNombre',
                    },
                ],
                [
                    {
                        text: data + "$",
                        style: 'valorTotal',
                    },
                ],
            ]
            tablaTotalesPagos.table.body.push(fila)
        })

        if (incluirTotales === "si") {
            c.push(tablaTotalesPagos)
        }
        return c
    } catch (error) {
        throw error
    }
}