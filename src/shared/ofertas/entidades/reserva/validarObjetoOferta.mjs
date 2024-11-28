import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerOfertasPorCodigoDescuentoArray } from "../../../../infraestructure/repository/ofertas/perfiles/obtenerOfertasPorCodigoDescuentoArray.mjs"
import { obtenerOfertasPorCodigoDescuentoArrayIgnorandoOfertaUID } from "../../../../infraestructure/repository/ofertas/perfiles/obtenerOfertasPorCodigoDescuentoArrayIgnorandoOfertaUID.mjs"
export const validarObjetoOferta = async (data) => {

    try {
        const oferta = data.oferta
        const modo = data.modo

        if (modo !== "actualizarOferta" && modo !== "crearOferta") {
            const m = "validarObjetOferta requiero campo modo en actualizarOferta o crearOfert para procesar el objeto"
            throw new Error(m)
        }

        validadoresCompartidos.tipos.cadena({
            string: oferta.nombreOferta,
            nombreCampo: "El campo del nombre de la oferta",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const fechaEntrada = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: oferta.fechaInicio,
            nombreCampo: "La fecha inicio de la vigencia de la oferta"
        })
        const fechaSalida = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: oferta.fechaFinal,
            nombreCampo: "La fecha fin de la vigencia de la oferta"
        })

        const entidadIDV = validadoresCompartidos.tipos.cadena({
            string: oferta.entidadIDV,
            nombreCampo: "El campo de entidadIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const entidadesIDV = ["reserva"]
        if (!entidadesIDV.includes(entidadIDV)) {
            const error = "No se reconoce el campo entidad"
            throw new Error(error)
        }

        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "igual"
        })

        const condicionesArray = validadoresCompartidos.tipos.array({
            array: oferta.condicionesArray,
            filtro: "filtroDesactivado",
            nombreCampo: "El array de condicionesArray"
        })
        const descuentosJSON = validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: oferta.descuentosJSON,
            nombreCampo: "El objeto de descuentosJSON"
        })

        if (condicionesArray.length === 0) {
            const error = "Añade al menos una condición a la oferta."
            throw new Error(error)
        }
        const zonaIDV = oferta.zonaIDV
        if (zonaIDV !== "global" && zonaIDV !== "publica" && zonaIDV !== "privada") {
            const error = "El campo zonaIDV solo admite global, pública o privada"
            throw new Error(error)
        }
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            oferta.testingVI = testingVI
        }
        const mensajeError = (data) => {
            const numeroMaximo = data.numeroMaximo
            const tipoCondicionIDV = data.tipoCondicionIDV
            const m = `El contenedor ${tipoCondicionIDV} no espera más de ${numeroMaximo} de llaves en el objeto`
            return m
        }

        const codigosDescuentosBase64DeLaMismaOferta = []
        for (const condicion of condicionesArray) {
            const tipoCondicionIDV = condicion?.tipoCondicion
            if (tipoCondicionIDV === "conFechaEntradaEntreRango") {

                if (Object.keys(condicion).length > 3) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 3
                    })
                    throw new Error(m)
                }

                const fechaInicioRango_ISO = condicion?.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion?.fechaFinalRango_ISO
                if (!fechaInicioRango_ISO) {
                    const error = "En el tipo de condicion conFechaEntradaEntreRango no hay definida la fecha de incio de rango."
                    throw new Error(error)
                }
                if (!fechaFinalRango_ISO) {
                    const error = "En el tipo de condicion conFechaEntradaEntreRango no hay definida la fecha final del rango"
                    throw new Error(error)
                }
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaInicioRango_ISO,
                    nombreCampo: `La fecha de incio de la condicion ${tipoCondicionIDV}`
                })
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaFinalRango_ISO,
                    nombreCampo: `La fecha de final de la condicion ${tipoCondicionIDV}`
                })

                await validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada: fechaInicioRango_ISO,
                    fechaSalida: fechaFinalRango_ISO,
                    tipoVector: "igual"
                })

            } else if (tipoCondicionIDV === "conFechaSalidaEntreRango") {

                if (Object.keys(condicion).length > 3) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 3
                    })
                    throw new Error(m)
                }

                const fechaInicioRango_ISO = condicion?.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion?.fechaFinalRango_ISO
                if (!fechaInicioRango_ISO) {
                    const error = "En el tipo de condicion conFechaSalidaEntreRango no hay definida la fecha de incio de rango."
                    throw new Error(error)
                }
                if (!fechaFinalRango_ISO) {
                    const error = "En el tipo de condicion conFechaSalidaEntreRango no hay definida la fecha final del rango"
                    throw new Error(error)
                }
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaInicioRango_ISO,
                    nombreCampo: `La fecha de incio de la condicion ${tipoCondicionIDV}`
                })
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaFinalRango_ISO,
                    nombreCampo: `La fecha de final de la condicion ${tipoCondicionIDV}`
                })

                await validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada: fechaInicioRango_ISO,
                    fechaSalida: fechaFinalRango_ISO,
                    tipoVector: "igual"
                })

            } else if (tipoCondicionIDV === "conFechaCreacionEntreRango") {
            } else if (tipoCondicionIDV === "porNumeroDeApartamentos") {

                if (Object.keys(condicion).length > 3) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 3
                    })
                    throw new Error(m)
                }


                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto" && tipoConteo !== "hastaUnNumeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el tipoConteo solo puede ser aPartirDe, numeroExacto o hastaUnNumeroExacto`
                    throw new Error(error)

                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.numeroDeApartamentos,
                    nombreCampo: "El campo numeroDeApartamentos en la condicion " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porApartamentosEspecificos") {
                if (Object.keys(condicion).length > 3) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 3
                    })
                    throw new Error(m)
                }


                const tipoDeEspecificidad = condicion.tipoDeEspecificidad
                if (tipoDeEspecificidad !== "exactamente"
                    &&
                    tipoDeEspecificidad !== "alguno"
                    &&
                    tipoDeEspecificidad !== "exactamenteEntreOtros"
                    &&
                    tipoDeEspecificidad !== "noDebeContenedorAlguno"
                    &&
                    tipoDeEspecificidad !== "noDebeContenedorExactamente"


                ) {
                    const error = "El campo tipoDeEspecificidad solo admite, exactamente, alguno o exactamenteEntreOtros"
                    throw new Error(error)
                }
                const apartamentos = condicion.apartamentos
                validadoresCompartidos.tipos.array({
                    array: apartamentos,
                    filtro: "filtroDesactivado",
                    nombreCampo: "Array de apartamento en la condición de porApartamentosEspecificos",
                    sePermitenDuplicados: "no"
                })
                const contenedorControlIDVUnicos = {}
                for (const contenedorApartamento of apartamentos) {
                    if (Object.keys(contenedorApartamento).length > 1) {
                        const m = "El contenedor de apartamentos en la condición porApartamentosEspecificos solo espera una llave."
                        throw new Error(m)
                    }

                    if (!contenedorApartamento.hasOwnProperty("apartamentoIDV")) {
                        const m = "Se esperaba que el contenedor de apartamentos de la condición de porApartamentosEspecificos tuviera la llave apartamentoIDV"
                        throw new Error(m)
                    }
                    const apartamentoIDV = contenedorApartamento.apartamentoIDV
                    validadoresCompartidos.tipos.cadena({
                        string: apartamentoIDV,
                        nombreCampo: "El apartamentoIDV",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                        soloMinusculas: "si"
                    })
                    if (contenedorControlIDVUnicos.hasOwnProperty(apartamentoIDV)) {
                        const m = "Hay identificadores visuales repetidos en el array de apartamentos del selector porApartamentosEspecificos"
                        throw new Error(m)
                    }
                    contenedorControlIDVUnicos[apartamentoIDV] = true
                    await obtenerConfiguracionPorApartamentoIDV({
                        apartamentoIDV,
                        errorSi: "noExiste"
                    })
                }
            } else if (tipoCondicionIDV === "porDiasDeAntelacion") {

                if (Object.keys(condicion).length > 3) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 3
                    })
                    throw new Error(m)
                }

                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe"
                    &&
                    tipoConteo !== "numeroExacto"
                    &&
                    tipoConteo !== "hastaUnNumeroExacto") {
                    const error = `En la condición ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw new Error(error)

                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.numeroDeDias,
                    nombreCampo: "El campo numeroDeDias en la condición " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    devuelveUnTipoNumber: "no",
                    impedirCero: "si",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porDiasDeReserva") {

                if (Object.keys(condicion).length > 3) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 3
                    })
                    throw new Error(m)
                }


                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto" && tipoConteo !== "hastaUnNumeroExacto") {
                    const error = `En la condición ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw new Error(error)

                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.numeroDeDias,
                    nombreCampo: "El campo numeroDeDias en la condición " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porRangoDeFechas") {
                if (Object.keys(condicion).length > 3) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 3
                    })
                    throw new Error(m)
                }


                const fechaInicioRango_ISO = condicion?.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion?.fechaFinalRango_ISO
                if (!fechaInicioRango_ISO) {
                    const error = "En el tipo de condición porRangoDeFechas no hay definida la fecha de inicio del rango"
                    throw new Error(error)

                }
                if (!fechaFinalRango_ISO) {
                    const error = "En el tipo de condicion porRangoDeFechas no hay definida la fecha del fin del rango"
                    throw new Error(error)

                }
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaInicioRango_ISO,
                    nombreCampo: `La fecha de incio de la condicion ${tipoCondicionIDV}`
                })
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: fechaFinalRango_ISO,
                    nombreCampo: `La fecha de final de la condicion ${tipoCondicionIDV}`
                })
                await validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada: fechaInicioRango_ISO,
                    fechaSalida: fechaFinalRango_ISO,
                    tipoVector: "diferente"

                })
            } else if (tipoCondicionIDV === "porCodigoDescuento") {

                if (Object.keys(condicion).length > 2) {
                    const m = mensajeError({
                        tipoCondicionIDV,
                        numeroMaximo: 2
                    })
                    throw new Error(m)
                }

                const codigoDescuentoAsci = condicion?.codigoDescuento
                const codigoDescuentoBase64 = validadoresCompartidos.tipos.cadena({
                    string: codigoDescuentoAsci,
                    nombreCampo: "Te falta el código de descuento en la condición de código de descuento.",
                    filtro: "transformaABase64",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    soloMinusculas: "si"
                })
                condicion.codigoDescuento = codigoDescuentoBase64
                codigosDescuentosBase64DeLaMismaOferta.push(codigoDescuentoBase64)
            } else {
                const error = "No se reconoce el tipo de la condicion"
                throw new Error(error)
            }
        }

        if (codigosDescuentosBase64DeLaMismaOferta.length > 0) {
            const controlDescuentosRepetidos = new Set(codigosDescuentosBase64DeLaMismaOferta).size !== codigosDescuentosBase64DeLaMismaOferta.length;
            if (controlDescuentosRepetidos) {
                const error = "Dentro de esta oferta tienes códigos de descuento repetidos"
                throw new Error(error)
            }
            if (modo === "crearOferta") {
                const ofertasConElMismoCodigo = await obtenerOfertasPorCodigoDescuentoArray(codigosDescuentosBase64DeLaMismaOferta)
                if (ofertasConElMismoCodigo.length > 0) {
                    const e = {
                        error: `Revisa los códigos de descuento de esta oferta porque existen en otras ofertas. Cada código de descuento sirve para cada oferta. Aunque una oferta puede tener varios códigos de descuento, no pueden existir códigos de descuentos iguales. A continuación se muestran las ofertas con el mismo código.`,
                        ofertasConElMismoCodigo: ofertasConElMismoCodigo
                    }
                    throw e
                }
            } else if (modo === "actualizarOferta") {
                const ofertasConElMismoCodigo = await obtenerOfertasPorCodigoDescuentoArrayIgnorandoOfertaUID({
                    ofertaUID: oferta.ofertaUID,
                    codigosDescuentosArray: codigosDescuentosBase64DeLaMismaOferta

                })
                if (ofertasConElMismoCodigo.length > 0) {
                    const e = {
                        error: `Revisa los códigos de descuento de esta oferta porque existen en otras ofertas. Cada código de descuento sirve para cada oferta. Aunque una oferta puede tener varios códigos de descuento, no pueden existir códigos de descuentos iguales. A continuación se muestran las ofertas con el mismo código.`,
                        ofertasConElMismoCodigo: ofertasConElMismoCodigo
                    }
                    throw e
                }
            }
        }

        const tipoDescuento = descuentosJSON.tipoDescuento
        if (tipoDescuento === "totalNeto") {

            if (Object.keys(descuentosJSON).length > 3) {
                const m = "El objeto de descuentosJSON para totalNeto no espera más de 3 llaves"
                throw new Error(m)
            }

            const tipoAplicacion = descuentosJSON.tipoAplicacion
            const descuentoTotal = descuentosJSON.descuentoTotal

            if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                const error = `En el descuento, el campo tipoAplicacion solo puede ser porcentaje o cantidadFija`
                throw new Error(error)
            }
            validadoresCompartidos.tipos.cadena({
                string: descuentoTotal,
                nombreCampo: `El campo descuentoTotla solo puede ser una cadena con un número con dos decimales separados por punto, tal que así 0.00`,
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })

        } else if (tipoDescuento === "mismoDescuentoParaCadaApartamento") {

            if (Object.keys(descuentosJSON).length > 3) {
                const m = "El objeto de descuentosJSON para mismoDescuentoParaCadaApartamento no espera mas de 3 llaves"
                throw new Error(m)
            }

            const tipoAplicacion = descuentosJSON.tipoAplicacion
            const descuentoTotal = descuentosJSON.descuentoTotal

            if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                const error = `En el descuento, el campo tipoAplicacion solo puede ser porcentaje o cantidadFija`
                throw new Error(error)
            }
            validadoresCompartidos.tipos.cadena({
                string: descuentoTotal,
                nombreCampo: `El campo descuentoTotla solo puede ser una cadena con un número con dos decimales separados por punto, tal que así 0.00`,
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })

        } else if (tipoDescuento === "individualPorApartamento") {

            if (Object.keys(descuentosJSON).length > 2) {
                const m = "El objeto de descuentosJSON para individualPorApartamento no espera más de 2 llaves"
                throw new Error(m)
            }


            const apartamentos = validadoresCompartidos.tipos.array({
                array: descuentosJSON.apartamentos,
                filtro: "filtroDesactivado",
                nombreCampo: "El array de descuentoPorDias"
            })

            for (const apartamentoIndividual of apartamentos) {
                if (Object.keys(apartamentoIndividual).length > 3) {
                    const m = "El contenedor de apartamentoIndividual del objeto de descuentosJSON para individualPorApartamento no espera mas de 3 llaves"
                    throw new Error(m)
                }
                const tipoAplicacion = apartamentoIndividual.tipoAplicacion
                const descuentoTotal = apartamentoIndividual.descuentoTotal
                const apartamentoIDV = apartamentoIndividual.apartamentoIDV
                if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                    const error = `En los descuentos, el campo tipoAplicacion solo puede ser porcentaje o cantidadFija`
                    throw new Error(error)
                }

                if (!apartamentoIndividual.hasOwnProperty("apartamentoIDV")) {
                    const error = `Dentro de los descuentos individualPorApartamento, en el contenedor de apartamentos, hay un objeto sin la llave apartamentoIDV`
                    throw new Error(error)
                }
                validadoresCompartidos.tipos.cadena({
                    string: descuentoTotal,
                    nombreCampo: `El campo descuentoTotal en ${tipoDescuento}, en el ${apartamentoIDV} solo puede ser una cadena con un número con dos decimales separados por punto, tal que así 0.00`,
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            }
        } else if (tipoDescuento === "porRango") {

            const fechaInicioRango_ISO = descuentosJSON.fechaInicioRango_ISO
            const fechaFinalRango_ISO = descuentosJSON.fechaFinalRango_ISO

            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaInicioRango_ISO,
                nombreCampo: `La fecha de incio de la condición ${fechaInicioRango_ISO}`
            })
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaFinalRango_ISO,
                nombreCampo: `La fecha de final de la condición ${fechaFinalRango_ISO}`
            })
            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicioRango_ISO,
                fechaSalida: fechaFinalRango_ISO,
                tipoVector: "igual"
            })

            const subTipoDescuento = descuentosJSON.subTipoDescuento
            if (subTipoDescuento === "totalNetoPorRango") {

                if (Object.keys(descuentosJSON).length > 6) {
                    const m = "El objeto de descuentosJSON para porRango en el subTipo totalNetoPorRango no espera más de 6 llaves"
                    throw new Error(m)
                }


                const tipoAplicacion = descuentosJSON.tipoAplicacion
                const descuentoTotal = descuentosJSON.descuentoTotal

                if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                    const error = `En ${subTipoDescuento} el tipo aplicación del descuento solo puede ser porcentaje o cantidadFija`
                    throw new Error(error)
                }
                validadoresCompartidos.tipos.cadena({
                    string: descuentoTotal,
                    nombreCampo: `El campo descuentoTotal en ${subTipoDescuento} del día solo puede ser una cadena con un número con dos decimales separados por punto, tal que así 0.00`,
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
            } else if (subTipoDescuento === "porDiasDelRango") {
                if (Object.keys(descuentosJSON).length > 5) {
                    const m = "El objeto de descuentosJSON para porRango en el subTipo porDiasDelRango no espera más de 5 llaves"
                    throw new Error(m)
                }

                const descuentoPorDias = validadoresCompartidos.tipos.array({
                    array: descuentosJSON.descuentoPorDias,
                    filtro: "filtroDesactivado",
                    nombreCampo: "El array de descuentoPorDias"
                })

                for (const dia of descuentoPorDias) {
                    const tipoDescuentoDelDia = dia.tipoDescuento

                    const fechaDelDia = await validadoresCompartidos.fechas.validarFecha_ISO({
                        fecha_ISO: dia.fecha,
                        nombreCampo: `La fecha del día`
                    })

                    const fechaEnRango = await validadoresCompartidos.fechas.fechaEnRango({
                        fechaAComprobrarDentroDelRango: fechaDelDia,
                        fechaInicioRango_ISO: fechaInicioRango_ISO,
                        fechaFinRango_ISO: fechaFinalRango_ISO,
                    })


                    if (!fechaEnRango) {
                        const error = `Dentro el día con fecha ${fechaDelDia} está fuera del rango entre ${fechaInicioRango_ISO} y ${fechaFinalRango_ISO}`
                        throw new Error(error)
                    }
                    if (!tipoDescuentoDelDia && tipoDescuentoDelDia !== "netoPorDia" && tipoDescuentoDelDia !== "netoPorApartamentoDelDia") {
                        const error = `Dentro el día con fecha ${fechaDelDia} el tipo de descuento del día solo puede ser netoPorDia o netoPorApartamentoDelDia`
                        throw new Error(error)
                    }

                    if (tipoDescuentoDelDia === "netoPorDia") {

                        if (Object.keys(dia).length > 4) {
                            const m = "El objeto de descuentosJSON para porRango en el subTipo porDiasDelRango, en el tipo de descuento netoPorDia no espera más de 4 llaves"
                            throw new Error(m)
                        }

                        const tipoAplicacion = dia.tipoAplicacion
                        const descuentoTotal = dia.descuentoTotal

                        if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                            const error = `En el día ${fechaDelDia} el tipo aplicación del descuento solo puede ser porcentaje o cantidadFija`
                            throw new Error(error)
                        }
                        validadoresCompartidos.tipos.cadena({
                            string: descuentoTotal,
                            nombreCampo: `En el día ${fechaDelDia}, el campo descuentoTotal solo puede ser una cadena con un número con dos decimales separados por punto.`,
                            filtro: "cadenaConNumerosConDosDecimales",
                            sePermiteVacio: "no",
                            impedirCero: "si",
                            devuelveUnTipoNumber: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } else if (tipoDescuentoDelDia === "netoPorApartamentoDelDia") {


                        if (Object.keys(dia).length > 3) {
                            const m = "El objeto de descuentosJSON para porRango en el subTipo porDiasDelRango, en el tipo de descuento netoPorApartamentoDelDia no espera más de 3 llaves"
                            throw new Error(m)
                        }


                        const fechaDelDia = await validadoresCompartidos.fechas.validarFecha_ISO({
                            fecha_ISO: dia.fecha,
                            nombreCampo: `La fecha de final del día`
                        })

                        const apartamentos = validadoresCompartidos.tipos.array({
                            array: dia.apartamentos,
                            filtro: "filtroDesactivado",
                            nombreCampo: `El array de apatamentos en el día ${fechaDelDia}`
                        })
                        for (const apartmentoDelDia of apartamentos) {

                            if (Object.keys(apartmentoDelDia).length > 3) {
                                const m = "El objeto de descuentosJSON para porRango en el subTipo porDiasDelRango, en el tipo de descuento netoPorApartamentoDelDia, concretamenteo en el conteneodr de apartamentos no espera más de 3 llaves"
                                throw new Error(m)
                            }

                            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                                string: apartmentoDelDia.apartamentoIDV,
                                nombreCampo: `El identificador visual del apartamento dentro del día ${fechaDelDia}.`,
                                filtro: "strictoIDV",
                                sePermiteVacio: "no",
                                limpiezaEspaciosAlrededor: "si",
                            })

                            await obtenerConfiguracionPorApartamentoIDV({
                                apartamentoIDV,
                                errorSi: "noExiste"
                            })
                            const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                                apartamentoIDV,
                                errorSi: "noExiste"
                            })).apartamentoUI

                            const tipoAplicacionDentroDelDia = apartmentoDelDia.tipoAplicacion
                            if (tipoAplicacionDentroDelDia !== "porcentaje" && tipoAplicacionDentroDelDia !== "cantidadFija") {
                                const error = `Dentro el día con fecha ${fechaDelDia} el tipo de descuento del ${apartamentoUI} (${apartamentoIDV}) solo puede ser porcentaje o cantidadFija`
                                throw new Error(error)
                            }

                            validadoresCompartidos.tipos.cadena({
                                string: apartmentoDelDia.descuentoTotal,
                                nombreCampo: `El campo descuentoTotal del día ${fechaDelDia} en el ${apartamentoUI} (${apartamentoIDV}) solo puede ser una cadena con un número con dos decimales separados por punto, tal que así 0.00`,
                                filtro: "cadenaConNumerosConDosDecimales",
                                sePermiteVacio: "no",
                                impedirCero: "si",
                                devuelveUnTipoNumber: "no",
                                limpiezaEspaciosAlrededor: "si",
                            })
                        }
                    } else {
                        const error = "No se reconoce subTipoDescuento, debe ser porDialDelRango o totalNetoPorRango: " + tipoDescuentoDelDia
                        throw new Error(error)
                    }
                }
            } else {
                const error = "No se reconoce subTipoDescuento, debe ser porDialDelRango o totalNetoPorRango"
                throw new Error(error)
            }
        } else {
            const error = "No se reconoce el tipo de descuento, el tipo de descuento solo puede ser totalNetoApartamentoDedicado, totalNetoReserva o porRango"
            throw new Error(error)
        }
    } catch (error) {
        throw error
    }
}