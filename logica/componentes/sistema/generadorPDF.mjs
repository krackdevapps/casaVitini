import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs';
import Decimal from 'decimal.js';
import { DateTime } from 'luxon';
const require = createRequire(import.meta.url);
const generadorPDF3 = async (reserva) => {
    try {
        const reservaFake = {
            reserva: {
                reserva: 1522,
                entrada: "01/01/2024",
                salida: "04/01/2024",
                estadoReserva: "confirmada",
                estadoPago: "noPagado",
                creacion: "30/11/2023 15:00",
                titular: {
                    nombreTitular: "TITULAR POOL NOMBRE COMPLETO",
                    pasaporteTitular: "PASPAORTENUMERO",
                    emailTitular: "email@servidor.com",
                    telefonoTitular: "9999999999",
                    tipoTitular: "titularPool"
                },
                origen: "administracion"
            },
            alojamiento: {
                "apartamento1": {
                    "apartamentoUI": "Apartamento 1",
                    "apartamentoUID": 1208,
                    "habitaciones": {}
                },
                "apartamento2": {
                    "apartamentoUI": "Apartamento 2",
                    "apartamentoUID": 1203,
                    "habitaciones": {}
                },
                "apartamento3": {
                    "apartamentoUI": "Apartamento 3",
                    "apartamentoUID": 1207,
                    "habitaciones": {}
                },
                "apartamento4": {
                    "apartamentoUI": "Apartamento 4",
                    "apartamentoUID": 1206,
                    "habitaciones": {}
                },
                "apartamento5": {
                    "apartamentoUI": "Apartamento 5",
                    "apartamentoUID": 1209,
                    "habitaciones": {}
                }
            },
            pernoctantesSinHabitacion: {
                "pernoctantes": [],
                "pernoctantesPool": []
            },
            desgloseFinanciero: {
                totalesPorNoche: [
                    {
                        fechaDiaConNoche: "2/1/2024",
                        precioNetoNoche: "126.00",
                        apartamentos: [
                            {
                                apartamentoUI: "Apartamento 2",
                                apartamentoIDV: "apartamento2",
                                precioBaseNoche: "50.00",
                                precioNetoNoche: "50.00"
                            },
                            {
                                apartamentoUI: "Apartamento 4",
                                apartamentoIDV: "apartamento4",
                                precioBaseNoche: "50.00",
                                precioNetoNoche: "50.00"
                            },
                            {
                                apartamentoUI: "Apartamento 3",
                                apartamentoIDV: "apartamento3",
                                precioBaseNoche: "15.00",
                                precioNetoNoche: "15.00"
                            },
                            {
                                apartamentoUI: "Apartamento 1",
                                apartamentoIDV: "apartamento1",
                                precioBaseNoche: "11.00",
                                precioNetoNoche: "11.00"
                            }
                        ]
                    },
                    {
                        fechaDiaConNoche: "3/1/2024",
                        precioNetoNoche: "126.00",
                        apartamentos: [
                            {
                                apartamentoUI: "Apartamento 2",
                                apartamentoIDV: "apartamento2",
                                precioBaseNoche: "50.00",
                                precioNetoNoche: "50.00"
                            },
                            {
                                apartamentoUI: "Apartamento 4",
                                apartamentoIDV: "apartamento4",
                                precioBaseNoche: "50.00",
                                precioNetoNoche: "50.00"
                            },
                            {
                                apartamentoUI: "Apartamento 3",
                                apartamentoIDV: "apartamento3",
                                precioBaseNoche: "15.00",
                                precioNetoNoche: "15.00"
                            },
                            {
                                apartamentoUI: "Apartamento 1",
                                apartamentoIDV: "apartamento1",
                                precioBaseNoche: "11.00",
                                precioNetoNoche: "11.00"
                            }
                        ]
                    },
                    {
                        fechaDiaConNoche: "1/1/2024",
                        precioNetoNoche: "126.00",
                        apartamentos: [
                            {
                                apartamentoUI: "Apartamento 2",
                                apartamentoIDV: "apartamento2",
                                precioBaseNoche: "50.00",
                                precioNetoNoche: "50.00"
                            },
                            {
                                apartamentoUI: "Apartamento 4",
                                apartamentoIDV: "apartamento4",
                                precioBaseNoche: "50.00",
                                precioNetoNoche: "50.00"
                            },
                            {
                                apartamentoUI: "Apartamento 3",
                                apartamentoIDV: "apartamento3",
                                precioBaseNoche: "15.00",
                                precioNetoNoche: "15.00"
                            },
                            {
                                apartamentoUI: "Apartamento 1",
                                apartamentoIDV: "apartamento1",
                                precioBaseNoche: "11.00",
                                precioNetoNoche: "11.00"
                            }
                        ]
                    }
                ],
                totalesPorApartamento: [
                    {
                        apartamentoIDV: "apartamento2",
                        apartamentoUI: "Apartamento 2",
                        totalNetoRango: "150.00",
                        precioMedioNocheRango: "50.00"
                    },
                    {
                        apartamentoIDV: "apartamento4",
                        apartamentoUI: "Apartamento 4",
                        totalNetoRango: "150.00",
                        precioMedioNocheRango: "50.00"
                    },
                    {
                        apartamentoIDV: "apartamento3",
                        apartamentoUI: "Apartamento 3",
                        totalNetoRango: "45.00",
                        precioMedioNocheRango: "15.00"
                    },
                    {
                        apartamentoIDV: "apartamento1",
                        apartamentoUI: "Apartamento 1",
                        totalNetoRango: "33.00",
                        precioMedioNocheRango: "11.00"
                    }
                ],
                ofertas: [
                    {
                        porNumeroDeApartamentos: [
                            {
                                nombreOferta: "Por numero de apartamentos",
                                tipoDescuento: "porcentaje",
                                tipoOferta: "porNumeroDeApartamentos",
                                cantidad: "15.00",
                                definicion: "Oferta aplicada a reserva con 2 o mas apartamentos",
                                descuento: "36.60"
                            }
                        ]
                    },
                    {
                        porApartamentosEspecificos: [
                            {
                                nombreOferta: "Por apartamentos en especifico",
                                tipoOferta: "porApartamentosEspecificos",
                                descuentoAplicadoA: "totalNetoApartmentoDedicado",
                                apartamentosEspecificos: [
                                    {
                                        apartamentoIDV: "apartamento2",
                                        apartamentoUI: "Apartamento 2",
                                        tipoDescuento: "porcentaje",
                                        cantidad: "5",
                                        descuento: "10.00"
                                    },
                                    {
                                        apartamentoIDV: "apartamento1",
                                        apartamentoUI: "Apartamento 1",
                                        tipoDescuento: "porcentaje",
                                        cantidad: "5",
                                        descuento: "2.20"
                                    }
                                ],
                                definicion: "Oferta aplicada con descuentos individuales a los apartamentos: Apartamento 2 y Apartamento 1",
                                descuento: "12.20"
                            }
                        ]
                    },
                    {
                        porDiaDeReserva: [
                            {
                                nombreOferta: "Por dias de la reserva",
                                tipoDescuento: "porcentaje",
                                cantidad: "5.00",
                                numero: "1",
                                simboloNumero: "aPartirDe",
                                definicion: "Oferta aplicada a reserva con 1 dias de duración o mas",
                                descuento: "12.2$ (5%)"
                            }
                        ]
                    },
                    {
                        porRangoDeFechas: []
                    },
                    {
                        porDiasDeAntelacion: [
                            {
                                nombreOferta: "Por dias de antelacion",
                                tipoDescuento: "porcentaje",
                                tipoOferta: "porDiasDeAntelacion",
                                cantidad: "4.00",
                                definicion: "Oferta aplicada a reserva con 1 dias de antelacion o mas ",
                                descuento: "9.76$ (4%)"
                            }
                        ]
                    }
                ],
                impuestos: [
                    {
                        nombreImpuesto: "Impuesto turistico",
                        tipoImpositivo: "10.00",
                        tipoValor: "tasa",
                        calculoImpuestoPorcentaje: null
                    },
                    {
                        nombreImpuesto: "IVA",
                        tipoImpositivo: "16.00",
                        tipoValor: "porcentaje",
                        calculoImpuestoPorcentaje: "60.48"
                    },
                    {
                        nombreImpuesto: "test",
                        tipoImpositivo: "14.00",
                        tipoValor: "porcentaje",
                        calculoImpuestoPorcentaje: "52.92"
                    },
                    {
                        nombreImpuesto: "Impuesto milenario",
                        tipoImpositivo: "10.00",
                        tipoValor: "porcentaje",
                        calculoImpuestoPorcentaje: "37.80"
                    },
                    {
                        nombreImpuesto: "ww",
                        tipoImpositivo: "1.00",
                        tipoValor: "porcentaje",
                        calculoImpuestoPorcentaje: "3.78"
                    },
                    {
                        nombreImpuesto: "ee",
                        tipoImpositivo: "1.00",
                        tipoValor: "porcentaje",
                        calculoImpuestoPorcentaje: "3.78"
                    },
                    {
                        nombreImpuesto: "rr",
                        tipoImpositivo: "1.00",
                        tipoValor: "porcentaje",
                        calculoImpuestoPorcentaje: "3.78"
                    },
                    {
                        nombreImpuesto: "tt",
                        tipoImpositivo: "1.00",
                        tipoValor: "tasa",
                        calculoImpuestoPorcentaje: null
                    },
                    {
                        nombreImpuesto: "ddddd",
                        tipoImpositivo: "10.00",
                        tipoValor: "tasa",
                        calculoImpuestoPorcentaje: null
                    },
                    {
                        nombreImpuesto: "Impuesto turistico invierno",
                        tipoImpositivo: "1.00",
                        tipoValor: "tasa",
                        calculoImpuestoPorcentaje: null
                    },
                    {
                        nombreImpuesto: "impuesto test 2",
                        tipoImpositivo: "15.00",
                        tipoValor: "tasa",
                        calculoImpuestoPorcentaje: null
                    },
                    {
                        nombreImpuesto: "impuesto de prueba",
                        tipoImpositivo: "10.00",
                        tipoValor: "tasa",
                        calculoImpuestoPorcentaje: null
                    }
                ],
                totales: {
                    promedioNetoPorNoche: "126.00",
                    totalReservaNetoSinOfertas: "378.00",
                    totalReservaNeto: "378.00",
                    totalDescuentos: null,
                    totalImpuestos: "209.54",
                    totalConImpuestos: "587.54"
                }
            }
        }
        //
        const datosGlobales = reserva.reserva
        const numeroReserva = datosGlobales.reserva
        const fechaEntrada_humana = reserva.reserva.entrada
        const fechaSalida_humana = reserva.reserva.salida
        const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada_humana)).fecha_ISO
        const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida_humana)).fecha_ISO
        
        const estadoReserva = reserva.reserva.estadoReserva
        const estadoPAgo = reserva.reserva.estadoPago
        if (!reserva.reserva.titular) {
            const error = "No se puede generar un pdf de una reserva que no tiene un titular asingado, primero asocia o crea un titular para esta reserva"
            throw new Error(error)
        }
        const nombreTitular = reserva.reserva.titular.nombreTitular || ""
        const pasaporteTitular = reserva.reserva.titular.pasaporteTitular || ""
        const telefonoTitular = reserva.reserva.titular.telefonoTitular || ""
        const emailTitular = reserva.reserva.titular.emailTitular || ""
        // Definir dos fechasc
        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada_ISO);
        const fechaSalida_objeto = DateTime.fromISO(fechaSalida_ISO);
        // Obtener la diferencia en días
        
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
                alignment: 'justify',
                style: "cabecera",
                columns: [
                    {
                        image: require.resolve('../../../componentes/pdf/logo.png'),
                        width: 100
                    },
                    {
                        text: numeroReserva,
                        style: "tituloReserva"
                    }
                ]
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
                    style: 'tablaTitular',
                    layout: 'headerLineOnly',
                    table: {
                        headerRows: 0,
                        widths: ['*'],
                        body: [
                            [
                                {
                                    text: nombreTitular,
                                    style: 'apartamentoNombre',
                                },
                            ],
                            [
                                {
                                    text: pasaporteTitular,
                                    style: 'apartamentoNombre',
                                },
                            ],
                            [
                                {
                                    text: emailTitular,
                                    style: 'apartamentoNombre',
                                },
                            ],
                            [
                                {
                                    text: telefonoTitular,
                                    style: 'apartamentoNombre',
                                },
                            ],
                        ]
                    },
                },
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
                                        text: fechaEntrada_humana,
                                        style: 'celdaTablaGlobalReserva',
                                        colSpan: 2,
                                        alignment: 'center'
                                    },
                                    /*  {
                                          text: 'Hora de entrada'
                                          , style: 'celdaTablaGlobalReserva'
                                          , alignment: 'center'
      
                                      }
                                      ,
                                      {
                                          text: 'A partir de las 14:00 (Hora local Nicaranguense)'
                                          , style: 'celdaTablaGlobalReserva'
                                          , alignment: 'center'
      
                                      }*/
                                ],
                                [
                                    {
                                        text: numeroDeDias + ' Días',
                                        colSpan: 2,
                                        alignment: 'center'
                                    },
                                    {
                                        text: nochesUI,
                                        //  style: 'celdaTablaGlobalReserva',
                                        alignment: 'center'
                                    }
                                ],
                                [
                                    {
                                        text: fechaSalida_humana,
                                        style: 'celdaTablaGlobalReserva',
                                        colSpan: 2,
                                        alignment: 'center'
                                    },
                                    /* 
                                    {
                                                                          text: 'Hora de salida',
                                          style: 'celdaTablaGlobalReserva',
                                          alignment: 'center'
      
                                      }
                                      ,
                                      {
                                          text: 'A partir de las 11:00 (Hora local Nicaranguense)',
                                          style: 'celdaTablaGlobalReserva',
                                          alignment: 'center'
      
                                      }
                                      */
                                ]
                            ]
                        ]
                    }
                },
            ],
            pageSize: 'A4',
            pageMargins: [20, 70, 20, 20],
            styles: {
                textoPaginacion: {
                    fontSize: 8,
                    alignment: "center"
                },
                cabecera: {
                    margin: [10, 10, 10, 10]
                },
                tituloReserva: {
                    fontSize: 16,
                    bold: true,
                    margin: [5, 15, 14, 10],
                    alignment: "right"
                },
                apartamentoNombre: {
                    fontSize: 8,
                    bold: true,
                    alignment: "left"
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
                textoSimple: {
                    fontSize: 8,
                    color: 'black',
                }
            },
            defaultStyle: {
                columnGap: 0
            }
        };
        const totalesPorApartamento = reserva.desgloseFinanciero.totalesPorApartamento
        if (totalesPorApartamento.length > 0) {
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
            for (const detallesPorApartamento of totalesPorApartamento) {
                const apartamentoUI = detallesPorApartamento.apartamentoUI
                const totalNetoRango = detallesPorApartamento.totalNetoRango
                const fila = [
                    [
                        {
                            text: apartamentoUI,
                            style: 'apartamentoNombre',
                        },
                    ],
                    [
                        {
                            text: totalNetoRango + '$',
                            style: 'valorTotal',
                        },
                    ],
                ]
                tablaFormatoPDFMake.table.body.push(fila)
            }
            docDefinition.content.push(tablaFormatoPDFMake)
        }
        const ofertasAplicadas = reserva.desgloseFinanciero.ofertas
        const impuestos = reserva.desgloseFinanciero.impuestos
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
                const nombreImpuesto = detallesImpuesto.nombreImpuesto
                const tipoImpositivo = detallesImpuesto.tipoImpositivo
                const tipoValor = detallesImpuesto.tipoValor
                const calculoImpuestoPorcentaje = detallesImpuesto.calculoImpuestoPorcentaje
                let valorFinal
                if (tipoValor === "tasa") {
                    valorFinal = tipoImpositivo + "$"
                }
                if (tipoValor === "porcentaje") {
                    valorFinal = `(${tipoImpositivo}%) ${calculoImpuestoPorcentaje}$`
                }
                const fila = [
                    [
                        {
                            text: nombreImpuesto,
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
        const totales = reserva.desgloseFinanciero.totales
        const objetoTraductor = {
            promedioNetoPorNoche: "Promedio neto por noche ponderado",
            totalReservaNetoSinOfertas: "Total de la reserva neto sin ofertas aplicadas",
            totalReservaNeto: "Total reserva neto",
            totalDescuentos: "Total suma descuentos aplicados",
            totalImpuestos: "Total impuestos aplicados",
            totalConImpuestos: "Total bruto final a pagar",
        }
        if (!totales.totalDescuentos) {
            delete totales.totalDescuentos
            delete totales.totalReservaNetoSinOfertas
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
                                text: 'Totales',
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
            text: 'Este documento es solo un resumen de su reserva con la información global de la reserva y los totales más relevantes. Si desea un desglose detallado, puede acceder a casavitini.com con su cuenta de usuario. Puede registrar su cuenta gratuitamente en https://casavitini.com/micasa/crear_nueva_cuenta. Recuerde usar la misma dirección de correo electrónico que utilizó para confirmar su reserva.',
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje1)
        const mensaje2 = {
            text: 'Si necesita ponerse en contacto con nosotros, puede enviarnos un email a casavitini@casavitini.com, tambien puede encontrar mas métodos de contacto en https://casavitini.com/contacto.',
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje2)
        const mensaje3 = {
            text: 'Este documento es meramente informativo. Para realizar el check-in, es necesario presentar algún tipo de documento identificativo, como un pasaporte o un documento nacional de identidad.',
            style: 'textoSimple'
        }
        docDefinition.content.push(mensaje3)
        // Totales por noche
        // Ofertas aplicadas
        // Totales
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
                    // Puedes hacer lo que necesites con 'archivo' antes de resolver la promesa
                    // Por ejemplo, guardar en un archivo, enviar como respuesta HTTP, etc.
                    resolve(archivo);
                });
                pdf.on('error', error => {
                    reject(error);
                });
                pdf.end();
            });
        };
        const archivo = await generarPDF(docDefinition);
        return archivo
    } catch (error) {
        throw error
    }
}
export {
    generadorPDF3
}
