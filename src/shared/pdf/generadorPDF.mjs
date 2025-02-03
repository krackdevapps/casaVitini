import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
import Decimal from 'decimal.js';
import { DateTime } from 'luxon';
import { utilidades } from '../../shared/utilidades.mjs';
import QRCode from 'qrcode'

const require = createRequire(import.meta.url);
export const generadorPDF = async (reserva) => {
    try {
        const global = reserva.global
        const reservaUID = global.reservaUID
        const fechaEntrada = global.fechaEntrada
        const fechaSalida = global.fechaSalida

        const fechaEntrada_humana = utilidades.conversor.fecha_ISO_hacia_humana(fechaEntrada)
        const fechaSalida_humana = utilidades.conversor.fecha_ISO_hacia_humana(fechaSalida)

        const estadoReserva = global.estadoReservaIDV
        const estadoPAgo = global.estadoPagoIDV
        const contenedorFinanciero = reserva.contenedorFinanciero

        const contenedorTitular = reserva.titular

        if (!contenedorTitular.hasOwnProperty("tipoTitularIDV")) {
            const error = "No se puede generar un pdf de una reserva que no tiene un titular asignado. Primero asocia o crea un titular para esta reserva"
            throw new Error(error)
        }

        const nombreTitular = contenedorTitular.nombreTitular || ""
        const pasaporteTitular = contenedorTitular.pasaporteTitular || ""
        const telefonoTitular = contenedorTitular.telefonoTitular || ""
        const mailTitular = contenedorTitular.mailTitular || ""

        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada);
        const fechaSalida_objeto = DateTime.fromISO(fechaSalida);


        const opciones = {
            margin: 0
        }

        const urlQR = `https://casavitini.com/qr/reserva:${reservaUID}`
        const qr = await QRCode.toDataURL(urlQR, opciones)

        const numeroDeDias = (fechaSalida_objeto.diff(fechaEntrada_objeto, "days").days) + 1;
        const numeroDeNoches = new Decimal(numeroDeDias).minus(1).toString()
        let nochesUI

        if (numeroDeNoches === "1") {
            nochesUI = numeroDeNoches + ' Noche'
        } else {
            nochesUI = numeroDeNoches + ' Noches'
        }
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const fonts = {
            Roboto: {
                normal: require.resolve('../../../componentes/pdf/fuentes/roboto-regular.ttf'),
                bold: require.resolve('../../../componentes/pdf/fuentes/roboto-bold.ttf'),
            },
        };
        const docDefinition = {
            header: {
                style: "cabecera",
                layout: 'noBorders',
                table: {
                    widths: ['auto', '*', 'auto'],
                    headerRows: 0,
                    body: [
                        [
                            {
                                image: require.resolve('../../../componentes/pdf/logo.png'),
                                width: 100,
                            },
                            {
                                layout: 'noBorders',
                                table: {
                                    widths: ['*'],
                                    headerRows: 1,
                                    body: [
                                        [
                                            {
                                                text: reservaUID,
                                                style: "tituloReserva"
                                            }
                                        ],
                                        [
                                            {
                                                text: nombreTitular,
                                                style: 'textoTitular',
                                            },
                                        ],
                                        [
                                            {
                                                text: mailTitular,
                                                style: 'textoTitular',
                                            },
                                        ],
                                        [
                                            {
                                                text: telefonoTitular,
                                                style: 'textoTitular',
                                            },
                                        ],
                                    ]
                                },
                            },
                            {
                                image: qr,
                                width: 90,
                            },
                        ],
                    ]
                }
            },
            footer: (currentPage, pageCount) => {
                return [
                    {
                        text: `Pàgina ${currentPage} de ${pageCount}`,
                        style: "textoPaginacion"
                    }
                ]
            },
            content: [
                {
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
                },
            ],
            pageSize: 'A4',
            pageMargins: [20, 120, 20, 20],
            styles: {
                textoPaginacion: {
                    fontSize: 8,
                    alignment: "center"
                },
                cabecera: {
                    margin: [20, 20, 20, 0],
                    width: 100
                },
                logo: {
                    alignment: "left",
                },
                qr: {
                    alignment: "right"
                },
                tituloReserva: {
                    fontSize: 10,
                    bold: true,

                    alignment: "right"
                },
                nombreSimple: {
                    color: "grey"
                },
                textoTitular: {
                    fontSize: 8,
                    alignment: "right"
                },
                valorTotal: {
                    fontSize: 8,
                    bold: true,
                    alignment: "right",
                    margin: [0, 0, 0, 0],
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tituloColumnaIzquierda: {
                    fontSize: 6,
                    bold: true,
                    colSpan: 2,
                    alignment: 'left'
                },
                tituloColumnaDerecha: {
                    fontSize: 6,
                    bold: true,
                    colSpan: 2,
                    alignment: 'right'
                },
                celdaTablaGlobalReserva: {
                    fontSize: 20,
                },
                tablaGlobalReserva: {
                    margin: [0, 5, 0, 15],
                    bold: true,
                    fontSize: 8,
                    color: 'black',
                },
                tablaAlojamiento: {
                    margin: [0, 5, 0, 15],
                    bold: true,
                    fontSize: 8,
                    color: 'black',
                },
                tablaTitular: {
                    bold: true,
                    fontSize: 8,
                },
                tablaTotales: {
                    margin: [0, 5, 0, 15],
                    bold: true,
                    fontSize: 8,
                    color: 'black',
                },
                contenedorServicio: {
                    margin: [0, 0, 0, 15],
                    bold: true,
                    fontSize: 8,
                    color: 'black',
                },
                textoSimple: {
                    fontSize: 8,
                    color: 'black',
                    margin: [0, 0, 0, 10],
                    alignment: "justify"


                }
            },
            defaultStyle: {
                columnGap: 0
            }
        };
        const totalesPorApartamento = contenedorFinanciero.desgloseFinanciero.entidades.reserva?.desglosePorApartamento || {}
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
            docDefinition.content.push(tablaFormatoPDFMake)
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

                    let precioFinal
                    if (tipoPrecio === "fijoPorReserva") {
                        precioFinal = `Total: ${precio}$`
                    } else if (tipoPrecio === "porNoche") {
                        precioFinal = `${precio}$ por noche (${noches} noches). Total: ${total}$`

                    }
                    const filaOpcion = [
                        { text: complementoUI, style: 'apartamentoNombre' },
                        { text: precioFinal, style: 'valorTotal' }
                    ];
                    contenedorServicio.table.body.push(filaOpcion);

                }

            }

            docDefinition.content.push(contenedorServicio)
        }
        const desglosePorServicios = contenedorFinanciero.desgloseFinanciero.entidades.servicios.desglosePorServicios
        if (desglosePorServicios.length > 0) {

            const contenedorServicio = {
                style: 'contenedorServicio',
                layout: 'lightHorizontalLines',
                table: {
                    widths: ['*', 100],
                    body: [
                        [
                            [
                                {
                                    text: 'Servicios',
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

            for (const s of desglosePorServicios) {

                const servicio = s.servicio
                const opcionesSeleccionadas = s.opcionesSolicitadasDelservicio.opcionesSeleccionadas
                const contenedor = servicio.contenedor
                const gruposDeOpciones = contenedor.gruposDeOpciones

                const tituloPublico = contenedor.tituloPublico


                const filaServicio = [
                    { text: tituloPublico, style: 'nombreSimple' },
                    { text: "", style: 'valorTotal' }
                ];
                contenedorServicio.table.body.push(filaServicio);
                for (const [grupoIDV, opcionesSel] of Object.entries(opcionesSeleccionadas)) {
                    if (opcionesSel.length > 0) {


                        const grupoSelecioonado = gruposDeOpciones[grupoIDV]
                        const opcionesGrupo = grupoSelecioonado.opcionesGrupo

                        opcionesGrupo.forEach(og => {
                            const opcionIDV = og.opcionIDV
                            if (opcionesSel.includes(opcionIDV)) {
                                const nombreOpcion = og.nombreOpcion
                                const precioOpcion = og.precioOpcion ? og.precioOpcion : "0.00"
                                const filaOpcion = [
                                    { text: nombreOpcion, style: 'apartamentoNombre' },
                                    { text: precioOpcion + "$", style: 'valorTotal' }
                                ];
                                contenedorServicio.table.body.push(filaOpcion);

                            }

                        });
                    }
                }

            }

            docDefinition.content.push(contenedorServicio)
        }
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
            docDefinition.content.push(tablaFormatoPDFMake)
        }
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
        docDefinition.content.push(tablaTotales)
        const mensaje1 = {
            text: 'Este documento es solo un resumen de su reserva con la información global de la reserva y los totales más relevantes. Si desea un desglose detallado, puede acceder a casavitini.com con su cuenta de usuario. Puede registrar su cuenta gratuitamente en https://casavitini.com/micasa/crear_nueva_cuenta. Recuerde usar la misma dirección de correo electrónico que utilizó para confirmar su reserva. Puede encontrar la dirección de correo electrónico que se usó para hacer la reserva en la parte superior derecha de este documento, justo al lado del código QR.',
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje1)
        const mensaje2 = {
            text: 'Si necesita ponerse en contacto con nosotros, puede encontrar mas métodos de contacto en https://casavitini.com/contacto.',
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje2)
        const mensaje3 = {
            text: `Existen distintos formatos para expresar fechas por escrito. Dependiendo del país, el formato nacional para representar fechas puede variar con respecto al de otros países. Debido al uso de distintos formatos nacionales para expresar fechas, este documento presenta las fechas en el estándar mundial ISO 8601, definido por la Organización Internacional de Normalización (ISO). Este estándar está diseñado para representar las fechas de manera internacional. Utiliza la estructura YYYY-MM-DD, donde YYYY representa el año, MM el mes y DD el día. Por ejemplo, la fecha 1234-02-01 hace referencia al 1 de febrero de 1234. Este formato es el que se utiliza en este documento para expresar las fechas de entrada y salida. Si necesita más información sobre este formato o desea conocer otros detalles, puede acceder a la web oficial del estándar o a su ficha en Wikipedia. A continuación, se detallan las URL de ambas:
            
            https://www.iso.org/iso-8601-date-and-time-format.html
            https://es.wikipedia.org/wiki/ISO_8601`,
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje3)
        const mensaje4 = {
            text: 'Este documento es meramente informativo. Para realizar el check-in, es necesario presentar algún documento identificativo, como un pasaporte o un documento nacional de identidad.',
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje4)
        const mensaje5 = {
            text: 'Puede usar el código QR para ir a los detalles de esta reserva de una manera fácil y cómoda.',
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje5)

        const generarPDF = async (docDefinition) => {
            return new Promise((resolve, reject) => {
                const printer = new pdfmake(fonts);
                const pdf = printer.createPdfKitDocument(docDefinition);
                const chunks = [];
                pdf.on('data', chunk => {
                    chunks.push(chunk);
                });
                pdf.on('end', () => {
                    const archivo = Buffer.concat(chunks);



                    const base64String = archivo.toString('base64');
                    resolve(base64String);

                });
                pdf.on('error', error => {
                    reject(error);
                });
                pdf.end();
            });
        };
        const archivo = await generarPDF(docDefinition);
        return archivo
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

