import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';
import Decimal from 'decimal.js';
import { DateTime } from 'luxon';
import QRCode from 'qrcode'
import { utilidades } from '../../../../../../shared/utilidades.mjs';
import { tablasAlojamiento } from './tablasAlojamiento.mjs';
import { tablasImpuestos } from './tablasImpuestos.mjs';
import { tablasTotales } from './tablasTotales.mjs';
import { tablasInfo } from './tablasInfo.mjs';
import { tablasPagos } from './tablasPagos.mjs';
import { contenedorFechas } from './contenedorFechas.mjs';
import { tablasServicios } from './tablasServicios.mjs';

const require = createRequire(import.meta.url);
export const esquemaGlobal = async (data) => {
    try {

        const incluirTitular = data.incluirTitular
        const reserva = data.reserva
        const tablasIDV = data.tablasIDV
        const configuracionPorTabla = data.configuracionPorTabla

        const global = reserva.global
        const reservaUID = global.reservaUID
        const fechaEntrada = global.fechaEntrada
        const fechaSalida = global.fechaSalida
        const contenedorFinanciero = reserva.contenedorFinanciero
        const detallesPagos = reserva.detallesPagos
        const contenedorTitular = reserva.titular

        if (!contenedorTitular.hasOwnProperty("tipoTitularIDV")) {
            const error = "No se puede generar un pdf de una reserva que no tiene un titular asignado. Primero asocia o crea un titular para esta reserva"
            throw new Error(error)
        }

        const nombreTitular = contenedorTitular.nombreTitular || ""
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
        const fonts = {
            Roboto: {
                normal: require.resolve('../com/fuentes/roboto-regular.ttf'),
                bold: require.resolve('../com/fuentes/roboto-bold.ttf'),
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
                                image: require.resolve('../com/logo.png'),
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
                                                text: "Reserva",
                                                style: "tituloDock"
                                            }
                                        ],
                                        [
                                            {
                                                text: reservaUID,
                                                style: "tituloReserva"
                                            }
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
            content: [],
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
                tituloDock: {
                    fontSize: 13,
                    bold: true,
                    alignment: "right",
                    color: "blue"
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
                    wordWrap: true

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
                    wordWrap: true,
                    maxWidth: "10px"
                },
                textoSimple: {
                    fontSize: 8,
                    color: 'black',
                    margin: [0, 0, 0, 10],
                    alignment: "justify"
                },
                sericio_nombreGrupoOpciones: {
                    color: "blue",
                    // alignment: "left",
                    background: "grey",
                    margin: [0, 0, 0, 0],

                },
                nombreAdaptativo: {
                    overflow: "hidde",
                    wordWrap: true
                }
            },
            defaultStyle: {
                columnGap: 0,
                wordWrap: true
            }
        };
        if (incluirTitular === "si") {

            const titularUI = [
                [
                    {
                        text: nombreTitular,
                        style: 'textoTitular',
                    }
                ], [
                    {
                        text: mailTitular,
                        style: 'textoTitular',
                    }
                ], [
                    {
                        text: telefonoTitular,
                        style: 'textoTitular',
                    }
                ],

            ]

            const globalData = docDefinition.header.table.body[0][1].table.body
            titularUI.forEach(d => {

                globalData.push(d)
            })

        }
        const areaDoc = docDefinition.content

        if (tablasIDV.includes("fechas")) {
            const f = contenedorFechas({
                fechaEntrada,
                fechaSalida,
                numeroDeNoches,
                numeroDeDias
            })
            areaDoc.push(f)
        }

        if (tablasIDV.includes("alojamiento")) {
            const tA = tablasAlojamiento({
                contenedorFinanciero
            })
            areaDoc.push(tA)

        }
        if (tablasIDV.includes("servicios")) {
            const tS = tablasServicios({
                contenedorFinanciero,
                configuracionPorTabla: configuracionPorTabla?.servicios
            })
            areaDoc.push(tS)
        }

        if (tablasIDV.includes("impuestos")) {
            const tI = tablasImpuestos({
                contenedorFinanciero
            })
            areaDoc.push(tI)
        }


        if (tablasIDV.includes("pagos")) {
            const tT = tablasPagos({
                detallesPagos,
                configuracionPorTabla: configuracionPorTabla?.pagos

            })
            areaDoc.push(tT)
        }

        if (tablasIDV.includes("totalesGlobales")) {
            const tT = tablasTotales({
                contenedorFinanciero
            })
            areaDoc.push(tT)
        }

        
        if (tablasIDV.includes("info")) {
            tablasInfo({
                doc: docDefinition.content
            })
        }

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

