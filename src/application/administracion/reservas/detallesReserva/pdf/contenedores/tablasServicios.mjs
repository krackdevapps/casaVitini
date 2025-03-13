export const tablasServicios = (data) => {


    try {

        const contenedorFinanciero = data.contenedorFinanciero
        const configuracionPorTabla = data.configuracionPorTabla || {}
        const c = []

        const incluirTotales = configuracionPorTabla?.incluirTotales || "no"
        const contnenedorUID = configuracionPorTabla?.contnenedorUID || []

        const iT = [
            "si", "no"
        ]
        if (!iT.includes(incluirTotales)) {
            throw new Error("incluirTotales en configuracionPorTabla en servicios debe de ser si o no")
        }



        const desglosePorServicios = contenedorFinanciero.desgloseFinanciero.entidades.servicios.desglosePorServicios
        const totalesServicios = contenedorFinanciero.desgloseFinanciero.entidades.servicios.global.totales
        if (desglosePorServicios.length > 0) {
            for (const s of desglosePorServicios) {
                const contenedorServicio = {
                    style: 'contenedorServicio',
                    layout: 'lightHorizontalLines',
                    table: {
                        widths: ['*', 'auto'],
                        body: [
                        ]
                    }
                }

                const servicio = s.servicio
                const servicioUID = servicio.servicioUID

                if (contnenedorUID.length > 0 && !contnenedorUID.includes(servicioUID)) {

                    continue
                }
                const opcionesSeleccionadas = s.opcionesSolicitadasDelservicio.opcionesSeleccionadas
                const contenedor = servicio.contenedor
                const gruposDeOpciones = contenedor.gruposDeOpciones
                const porGruposDeOpciones = s.totalesDelServicio.porGruposDeOpciones
                const totalesServicio = s.totalesDelServicio.global
                //  
                //  
                const tipoDescuentoAplicadoAlServicio = totalesServicio.tipoDescuentoAplicadoAlServicio
                //  
                const tituloPublico = contenedor.tituloPublico


                const filaServicio = [
                    { text: tituloPublico, style: 'tituloColumnaIzquierda' },
                    { text: "", style: 'valorTotal' }
                ];
                contenedorServicio.table.body.push(filaServicio);

                for (const [grupoIDV, opcionesSel] of Object.entries(opcionesSeleccionadas)) {
                    if (opcionesSel.length > 0) {

                        //     

                        const grupoSelecioonado = gruposDeOpciones[grupoIDV]
                        const nombreGrupo = grupoSelecioonado.nombreGrupo

                        const filaOpcion = [
                            { text: nombreGrupo, style: 'nombreSimple' },
                            { text: "", style: 'valorTotal' }
                        ];
                        contenedorServicio.table.body.push(filaOpcion);
                        const opcionesGrupo = grupoSelecioonado.opcionesGrupo

                        opcionesGrupo.forEach(og => {

                            const opcionesSelArray = opcionesSel.map(oS => oS.opcionIDV)

                            const opcionIDV = og.opcionIDV


                            if (opcionesSelArray.includes(opcionIDV)) {
                                const totalesOpcion = porGruposDeOpciones[grupoIDV][opcionIDV]

                                const nombreOpcion = og.nombreOpcion
                                const precioOpcion = totalesOpcion?.total ? totalesOpcion.total : "0.00"
                                // 

                                const totalUI = {
                                    "Precio unidad": totalesOpcion.precioUnidad,
                                    "Cantidad": totalesOpcion.cantidad,
                                    //"Total": totalesOpcion.precioConCantidad,
                                }

                                const tipoDescuento = totalesOpcion.tipoDescuento
                                if (tipoDescuento === "cantidad") {
                                    totalUI["Descuento"] = totalesOpcion.descuentoAplicado + "$"
                                } else if (tipoDescuento === "porcentaje") {
                                    totalUI["Descuento"] = totalesOpcion.descuentoAplicado + "%"
                                }
                                totalUI["Total"] = totalesOpcion.total

                                const textoArray = []
                                Object.entries(totalUI).forEach(o => {
                                    const [nombre, valor] = o
                                    const linea = `${nombre}: ${valor}\n`
                                    textoArray.push(linea)
                                })




                                const filaOpcion = [
                                    { text: nombreOpcion, style: 'nombreAdaptativo' },
                                    { text: textoArray.join(""), style: 'valorTotal' }
                                ];
                                contenedorServicio.table.body.push(filaOpcion);
                            }
                        });
                    }
                }
                //contenedorTituloServicio.table.push(contenedorServicio)




                let totalDelServicioUI
                if (tipoDescuentoAplicadoAlServicio === "sinDescuento") {
                    totalDelServicioUI = totalesServicio.totalServicio
                } else if (tipoDescuentoAplicadoAlServicio === "cantidad") {
                    const totalGruposServicio = totalesServicio.totalGruposServicio
                    const descuentoAplicadoAlServicio = totalesServicio.descuentoAplicadoAlServicio

                    totalDelServicioUI = totalesServicio.totalServicio
                } else if (tipoDescuentoAplicadoAlServicio === "porPorcentaje") {
                    const totalGruposServicio = totalesServicio.totalGruposServicio
                    const descuentoAplicadoAlServicio = totalesServicio.descuentoAplicadoAlServicio
                    totalDelServicioUI = totalesServicio.totalServicio
                }

                const totalUI = {}
                if (tipoDescuentoAplicadoAlServicio === "cantidad") {
                    totalUI["Total de las opciones del servicio"] = totalesServicio.totalGruposServicio, + "$"
                    totalUI["Descuento aplicado a todo el servicio"] = totalesServicio.descuentoAplicadoAlServicio + "$"
                } else if (tipoDescuentoAplicadoAlServicio === "porcentaje") {
                    totalUI["Total de las opciones del servicio"] = totalesServicio.totalGruposServicio, + "$"
                    totalUI["Descuento aplicado a todo el servicio"] = totalesServicio.descuentoAplicadoAlServicio + "%"
                }
                totalUI["Total"] = totalesServicio.totalServicio + "$"

                const textoArray = []
                Object.entries(totalUI).forEach(o => {

                    const [nombre, valor] = o
                    const linea = `${nombre}: ${valor}\n`
                    textoArray.push(linea)
                })



                const filaTotales = [
                    { text: "Total del servicio", style: 'tituloColumnaIzquierda' },
                    { text: textoArray, style: 'valorTotal' }
                ];
                contenedorServicio.table.body.push(filaTotales);

                c.push(contenedorServicio)


            }


            const tablaTotalesServicios = {
                style: 'contenedorServicio',
                layout: 'lightHorizontalLines',
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            [
                                {
                                    text: 'Totales de servicios',
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

            if (incluirTotales === "si") {
                c.push(tablaTotalesServicios)
            }



            const totalSinDescuentosAplicados = totalesServicios.totalSinDescuentosAplicados
            const descuentoAplicados = totalesServicios.descuentoAplicados
            const totalConDescuentoAplicados = totalesServicios.totalConDescuentoAplicados
            const impuestosAplicados = totalesServicios.impuestosAplicados
            const totalNeto = totalesServicios.totalNeto
            const totalFinal = totalesServicios.totalFinal

            const totalesDict = {
                totalSinDescuentosAplicados: "Totales sin descuentos aplicados",
                descuentoAplicados: "Total descuentos aplicados",
                totalConDescuentoAplicados: "Total con descuentos aplicados",
                totalNeto: "Total neto",
                impuestosAplicados: "Impuestos aplicados",
                totalFinal: "Total final"
            }

            if (impuestosAplicados === "0.00") {
                delete totalesServicios.totalNeto
            }
            for (const [nombreTotal, valorTotal] of Object.entries(totalesServicios)) {
                const nombreTotalUI = totalesDict[nombreTotal]
                if (valorTotal === "0.00") {
                    continue
                }

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
                tablaTotalesServicios.table.body.push(fila)
            }
        }
        return c
    } catch (error) {
        throw error
    }
}