casaVitini.view = {
    start: function () {
        const granuladorURL = casaVitini.utilidades.granuladorURL()
        const parametros = granuladorURL.parametros

        if (parametros?.usuario) {

            this.ultimasRevisionesDelUsuario.arranque({
                usuario: parametros?.usuario
            })
        } else {
            this.mostrarUsuariosConRevisiones()
        }
    },
    mostrarUsuariosConRevisiones: async function () {

        const main = document.querySelector("main")
        main.classList.add("flextJustificacion_center")
        const spinner = casaVitini.ui.componentes.spinnerSimple()
        main.appendChild(spinner)

        const respuestaServidor = await casaVitini.shell.servidor({
            zona: "administracion/protocolos/alojamiento/revisionesPorUsuario/obtenerUsuariosConRevisiones"
        })
        spinner.remove()
        main.classList.remove("flextJustificacion_center")

        const mER = casaVitini.ui.componentes.constructorElemento({
            tipoElemento: "div",
            classList: [
                "marcoElasticoRelativo",
            ]
        })

        main.appendChild(mER)
        if (respuestaServidor?.error) {
            const errorUI = casaVitini.ui.componentes.constructorElemento({
                tipoElemento: "p",
                classList: [
                    "padding6",
                ],
                textContent: respuestaServidor.error
            })

            mER.appendChild(errorUI)
            return

        }
        if (respuestaServidor.ok) {


            const info = casaVitini.ui.componentes.constructorElemento({
                tipoElemento: "p",
                classList: [
                    "padding16", "textoCentrado",
                ],
                textContent: "Aquí se muestran los usuarios con revisiones finalizadas o en curso. Si pulsas en el usuario, se muestran las últimas 5 revisiones. Dentro de la lista de revisiones puedes obtener la lista completa de revisiones del usuario."
            })
            mER.appendChild(info)


            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("contenedorBotones")
            mER.appendChild(contenedorBotones)



            const usuariosConRevisiones = respuestaServidor.usuariosConRevisiones
            usuariosConRevisiones.forEach(u => {
                const usuario = u.usuario

                const ui = document.createElement("a")
                ui.classList.add("tituloContextoAdministracion")
                ui.href = `/administracion/protocolos/revisiones_por_usuario/usuario:${usuario}`

                ui.textContent = usuario
                contenedorBotones.appendChild(ui)
            });
        }
    },
    ultimasRevisionesDelUsuario: {
        arranque: async function (data) {
            const usuario = data.usuario


            const main = document.querySelector("main")
            main.classList.add("flextJustificacion_center")
            const spinner = casaVitini.ui.componentes.spinnerSimple()
            main.appendChild(spinner)

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/protocolos/alojamiento/revisionesPorUsuario/obtenerCincoUltimasRevisionesPorUsuario",
                usuario
            })
            spinner.remove()
            main.classList.remove("flextJustificacion_center")

            const mER = casaVitini.ui.componentes.constructorElemento({
                tipoElemento: "div",
                classList: [
                    "marcoElasticoRelativo",
                ]
            })

            main.appendChild(mER)
            if (respuestaServidor?.error) {
                const errorUI = casaVitini.ui.componentes.constructorElemento({
                    tipoElemento: "p",
                    classList: [
                        "padding6",
                    ],
                    textContent: respuestaServidor.error
                })

                mER.appendChild(errorUI)
                return

            }
            if (respuestaServidor.ok) {

                const info = casaVitini.ui.componentes.constructorElemento({
                    tipoElemento: "p",
                    classList: [
                        "padding16", "textoCentrado",
                    ],
                    textContent: "Últimas 5 revisiones del usuario, finalizadas o en curso."
                })
                mER.appendChild(info)


                const botonTodasLasRevisiones = casaVitini.ui.componentes.constructorElemento({
                    tipoElemento: "a",
                    classList: [
                        "botonV1BlancoIzquierda",
                    ],
                    textContent: "Ver todas las revisiones del usuario"
                })
                botonTodasLasRevisiones.href = `/administracion/protocolos/registro_de_revisiones/buscar:${usuario}`
                botonTodasLasRevisiones.addEventListener("click", casaVitini.shell.navegacion.cambiarVista)
                mER.appendChild(botonTodasLasRevisiones)

                const contenedorBotones = document.createElement("div")
                contenedorBotones.classList.add("contenedorRevisiones")
                mER.appendChild(contenedorBotones)

                const dict = {
                    finalizada: "Finalizada",
                    enCurso: "En curso"
                }


                const ultimasRevisiones = respuestaServidor.ultimasRevisiones
                ultimasRevisiones.forEach(r => {
                    const revisionUID = r.utilidades
                    const estadoRevision = r.estadoRevision
                    const fechaInicio = r.fechaInicio
                    const fechaFin = r.fechaInicio
                    const fechaFinLocal = r.fechaFinLocal
                    const revisionResumen = r.revisionResumen
                    const apartamentoUI = r.apartamentoUI

                    const c = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "div",
                        classList: [
                            "tituloContextoAdministracion"
                        ],
                    })
                    contenedorBotones.appendChild(c)

                    const alojamiento = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        classList: [
                            "padding6"
                        ],
                        textContent: apartamentoUI
                    })
                    c.appendChild(alojamiento)


                    const rR_info = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        classList: [
                            "padding6"
                        ],
                        textContent: revisionResumen
                    })
                    c.appendChild(rR_info)


                    const estadoUI = casaVitini.ui.componentes.constructorElemento({
                        tipoElemento: "p",
                        classList: [
                            "padding6"
                        ],
                        textContent: dict[estadoRevision]
                    })
                    c.appendChild(estadoUI)


                    if (estadoRevision === "finalizada") {

                        const contenedorFechaFin = casaVitini.ui.componentes.constructorElemento({
                            tipoElemento: "div",
                            classList: [
                                "flexVertical"
                            ]
                        })
                        c.appendChild(contenedorFechaFin)

                        const tituloFechaFin = casaVitini.ui.componentes.constructorElemento({
                            tipoElemento: "p",
                            classList: [
                                "padding6"
                            ],
                            textContent: "Fecha fin de la revisión"
                        })
                        contenedorFechaFin.appendChild(tituloFechaFin)

                        const fechaFinLocal_UI = casaVitini.utilidades.conversor.fecha_ISOCompleta_limpieza(fechaFinLocal)
                        const fechaFinalUI = casaVitini.ui.componentes.constructorElemento({
                            tipoElemento: "p",
                            classList: [
                                "padding6"
                            ],
                            textContent: fechaFinLocal_UI
                        })
                        contenedorFechaFin.appendChild(fechaFinalUI)
                    }



                });
            }
        }
    }

}