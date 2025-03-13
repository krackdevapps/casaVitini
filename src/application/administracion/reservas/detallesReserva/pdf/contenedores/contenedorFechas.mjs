export const contenedorFechas = (data) => {


    try {


        const fechaEntrada = data.fechaEntrada
        const fechaSalida = data.fechaSalida
        const numeroDeNoches = data.numeroDeNoches
        const numeroDeDias = data.numeroDeDias
        const c = []


        let nochesUI

        if (numeroDeNoches === "1") {
            nochesUI = numeroDeNoches + ' Noche'
        } else {
            nochesUI = numeroDeNoches + ' Noches'
        }

        const fechas = {
            style: 'tablaGlobalReserva',
            layout: 'lightHorizontalLines',
            table: {
                widths: ['*', '*', '*'],
                body: [
                    [
                        [
                            {
                                text: 'Fecha de entrada',
                                style: 'tituloColumna',
                                colSpan: 2,
                                alignment: 'center'
                            }
                        ],
                        [
                            {
                                text: 'Duración de la reserva',
                                style: 'tituloColumna',
                                colSpan: 2,
                                alignment: 'center'
                            }
                        ],
                        [
                            {
                                text: 'Fecha de salida',
                                style: 'tituloColumna',
                                colSpan: 2,
                                alignment: 'center'
                            }
                        ]
                    ],
                    [
                        [
                            {
                                text: fechaEntrada,
                                style: 'celdaTablaGlobalReserva',
                                colSpan: 2,
                                alignment: 'center'
                            },
                        ],
                        [
                            {
                                text: numeroDeDias + ' Días',
                                colSpan: 2,
                                alignment: 'center'
                            },
                            {
                                text: nochesUI,
                                alignment: 'center'
                            }
                        ],
                        [
                            {
                                text: fechaSalida,
                                style: 'celdaTablaGlobalReserva',
                                colSpan: 2,
                                alignment: 'center'
                            },
                        ]
                    ]
                ]
            }
        }
        c.push(fechas)

        return c
    } catch (error) {
        throw error
    }
}