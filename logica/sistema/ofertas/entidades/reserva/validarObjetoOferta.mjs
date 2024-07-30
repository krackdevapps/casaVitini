import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs"
import { obtenerOfertasPorCodigoDescuentoArray } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorCodigoDescuentoArray.mjs"
import { obtenerOfertasPorCodigoDescuentoArrayIgnorandoOfertaUID } from "../../../../repositorio/ofertas/perfiles/obtenerOfertasPorCodigoDescuentoArrayIgnorandoOfertaUID.mjs"
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
            nombreCampo: "El array de condicionesArray"
        })
        const descuentosJSON = validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: oferta.descuentosJSON,
            nombreCampo: "El objeto de descuentosJSON"
        })
        if (condicionesArray.length === 0) {
            const error = "Añade al menos una condiciona la oferta"
            throw new Error(error)
        }
        const zonaIDV = oferta.zonaIDV
        if (zonaIDV !== "global" && zonaIDV !== "publica" && zonaIDV !== "privada") {
            const error = "el campo zonaIDV solo admite global, publica o privada"
            throw new Error(error)
        }
        const codigosDescuentosBase64DeLaMismaOferta = []
        for (const condicion of condicionesArray) {
            const tipoCondicionIDV = condicion?.tipoCondicion
            if (tipoCondicionIDV === "conFechaEntradaEntreRango") {
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

            } else if (tipoCondicionIDV === "conFechaCreacionEntreRango") {
            } else if (tipoCondicionIDV === "porNumeroDeApartamentos") {

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
                    // &&
                    // tipoDeEspecificidad !== "noDebeContenedorExactamenteEntreOtros"
                ) {
                    const error = "el campo tipoDeEspecificidad solo admite exactamente, alguno o exactamenteEntreOtros"
                    throw new Error(error)
                }
                const apartamentos = condicion.apartamentos
                validadoresCompartidos.tipos.array({
                    array: apartamentos,
                    nombreCampo: "Array de apartamento en la condicion de porApartamentosEspecificos",
                    sePermitenDuplicados: "no"
                })
                const contenedorControlIDVUnicos = {}
                for (const contenedorApartamento of apartamentos) {
                    if (!contenedorApartamento.hasOwnProperty("apartamentoIDV")) {
                        const m = "Se esperaba que el contenedor de apartamentos de la condicion de porApartamentosEspecificos tuviera la llave apartamentoIDV"
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
                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe"
                    &&
                    tipoConteo !== "numeroExacto"
                    &&
                    tipoConteo !== "hastaUnNumeroExacto") {
                    const error = `En la condicion ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw new Error(error)

                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.numeroDeDias,
                    nombreCampo: "El campo numeroDeDias en la condicion " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    devuelveUnTipoNumber: "no",
                    impedirCero: "si",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porDiasDeReserva") {
                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto" && tipoConteo !== "hastaUnNumeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw new Error(error)

                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.numeroDeDias,
                    nombreCampo: "El campo numeroDeDias en la condicion " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porRangoDeFechas") {
                const fechaInicioRango_ISO = condicion?.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion?.fechaFinalRango_ISO
                if (!fechaInicioRango_ISO) {
                    const error = "En el tipo de condicion porRangoDeFechas no hay definida la fecha de inicio del rango"
                    throw new Error(error)

                }
                if (!fechaFinalRango_ISO) {
                    const error = "En el tipo de condicion porRangoDeFechas no hay definida la fecha del find el rango"
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
                const codigoDescuentoAsci = condicion?.codigoDescuento
                const codigoDescuentoBase64 = validadoresCompartidos.tipos.cadena({
                    string: codigoDescuentoAsci,
                    nombreCampo: "Te falta el codigo de descuento en la condicion de codigo de descuento.",
                    filtro: "transformaABase64",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
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
                const error = "Dentro de esta oferta tienes codigos de descuento repetidos"
                throw new Error(error)
            }
            if (modo === "crearOferta") {
                const ofertasConElMismoCodigo = await obtenerOfertasPorCodigoDescuentoArray(codigosDescuentosBase64DeLaMismaOferta)
                if (ofertasConElMismoCodigo.length > 0) {
                    const e = {
                        error: `Revisa los codigos de descuento de esta oferta por que existen en otras ofertas. Cada codigo de descuento sirve para cada oferta, aunque una oferta puede tener varios codigos de descuento, no pueden existir codigo de descuentos iguales. A continguacions se muestran las ofertas con el mismo codigo.`,
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
                        error: `Revisa los codigos de descuento de esta oferta por que existen en otras ofertas. Cada codigo de descuento sirve para cada oferta, aunque una oferta puede tener varios codigos de descuento, no pueden existir codigo de descuentos iguales. A continguacions se muestran las ofertas con el mismo codigo.`,
                        ofertasConElMismoCodigo: ofertasConElMismoCodigo
                    }
                    throw e
                }
            }
        }

        const tipoDescuento = descuentosJSON.tipoDescuento
        if (tipoDescuento === "totalNeto") {

            const tipoAplicacion = descuentosJSON.tipoAplicacion
            const descuentoTotal = descuentosJSON.descuentoTotal

            if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                const error = `En la descuentos, el campo tipoAplicacion solo puede ser porcentaje o cantidadFija`
                throw new Error(error)
            }
            validadoresCompartidos.tipos.cadena({
                string: descuentoTotal,
                nombreCampo: `El campo descuentoTotla solo puede ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })

        } else  if (tipoDescuento === "mismoDescuentoParaCadaApartamento") {

            const tipoAplicacion = descuentosJSON.tipoAplicacion
            const descuentoTotal = descuentosJSON.descuentoTotal

            if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                const error = `En la descuentos, el campo tipoAplicacion solo puede ser porcentaje o cantidadFija`
                throw new Error(error)
            }
            validadoresCompartidos.tipos.cadena({
                string: descuentoTotal,
                nombreCampo: `El campo descuentoTotla solo puede ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })

        } else  if (tipoDescuento === "individualPorApartamento") {

            const apartamentos = validadoresCompartidos.tipos.array({
                array: descuentosJSON.apartamentos,
                nombreCampo: "El array de descuentoPorDias"
            })

            for (const apartamentoIndividual of apartamentos) {

                const tipoAplicacion = apartamentoIndividual.tipoAplicacion
                const descuentoTotal = apartamentoIndividual.descuentoTotal
                const apartamentoIDV = apartamentoIndividual.apartamentoIDV
                if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                    const error = `En la descuentos, el campo tipoAplicacion solo puede ser porcentaje o cantidadFija`
                    throw new Error(error)
                }

                if (!apartamentoIndividual.hasOwnProperty("apartamentoIDV")) {
                    const error = `Dentro del descuentos individualPorApartamento, en el contenedor de apartamentos, hay un objeto sin la llave apartamentoIDV`
                    throw new Error(error)
                }
                validadoresCompartidos.tipos.cadena({
                    string: descuentoTotal,
                    nombreCampo: `El campo descuentoTotal en ${tipoDescuento}, en el ${apartamentoIDV} solo puede ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
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
                nombreCampo: `La fecha de incio de la condicion ${fechaInicioRango_ISO}`
            })
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaFinalRango_ISO,
                nombreCampo: `La fecha de final de la condicion ${fechaFinalRango_ISO}`
            })
            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada: fechaInicioRango_ISO,
                fechaSalida: fechaFinalRango_ISO,
                tipoVector: "diferente"
            })


            const subTipoDescuento = descuentosJSON.subTipoDescuento

            if (subTipoDescuento === "totalNetoPorRango") {
                const tipoAplicacion = descuentosJSON.tipoAplicacion
                const descuentoTotal = descuentosJSON.descuentoTotal

                if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                    const error = `En ${subTipoDescuento} el tipo aplicacion del descuento solo puede ser porcentaje o cantidadFija`
                    throw new Error(error)
                }
                validadoresCompartidos.tipos.cadena({
                    string: descuentoTotal,
                    nombreCampo: `El campo descuentoTotal en ${subTipoDescuento} del dia solo puede ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
            } else if (subTipoDescuento === "porDiasDelRango") {

                const descuentoPorDias = validadoresCompartidos.tipos.array({
                    array: descuentosJSON.descuentoPorDias,
                    nombreCampo: "El array de descuentoPorDias"
                })

                for (const dia of descuentoPorDias) {
                    const tipoDescuentoDelDia = dia.tipoDescuento

                    const fechaDelDia = await validadoresCompartidos.fechas.validarFecha_ISO({
                        fecha_ISO: dia.fecha,
                        nombreCampo: `La fecha del dia`
                    })

                    const fechaEnRango = await validadoresCompartidos.fechas.fechaEnRango({
                        fechaAComprobrarDentroDelRango: fechaDelDia,
                        fechaInicioRango_ISO: fechaInicioRango_ISO,
                        fechaFinRango_ISO: fechaFinalRango_ISO,
                    })


                    if (!fechaEnRango) {
                        const error = `Dentro el dia con fecha ${fechaDelDia} esta fuera del rango entre ${fechaInicioRango_ISO} y ${fechaFinalRango_ISO}`
                        throw new Error(error)
                    }
                    if (!tipoDescuentoDelDia && tipoDescuentoDelDia !== "netoPorDia" && tipoDescuentoDelDia !== "netoPorApartamentoDelDia") {
                        const error = `Dentro el dia con fecha ${fechaDelDia} el tipo de descuento del dia solo puede ser netoPorDia o netoPorApartamentoDelDia`
                        throw new Error(error)
                    }

                    if (tipoDescuentoDelDia === "netoPorDia") {
                        const tipoAplicacion = dia.tipoAplicacion
                        const descuentoTotal = dia.descuentoTotal

                        if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                            const error = `En el dia ${fechaDelDia} el tipo aplicacion del descuento solo puede ser porcentaje o cantidadFija`
                            throw new Error(error)
                        }
                        validadoresCompartidos.tipos.cadena({
                            string: descuentoTotal,
                            nombreCampo: `En el dia ${fechaDelDia}, el campo descuentoTotal solo puede ser una cadena con un numero con dos decimales separados por punto.`,
                            filtro: "cadenaConNumerosConDosDecimales",
                            sePermiteVacio: "no",
                            impedirCero: "si",
                            devuelveUnTipoNumber: "no",
                            limpiezaEspaciosAlrededor: "si",
                        })
                    } else if (tipoDescuentoDelDia === "netoPorApartamentoDelDia") {

                        const fechaDelDia = await validadoresCompartidos.fechas.validarFecha_ISO({
                            fecha_ISO: dia.fecha,
                            nombreCampo: `La fecha de final del dia`
                        })

                        const apartamentos = validadoresCompartidos.tipos.array({
                            array: dia.apartamentos,
                            nombreCampo: `El array de apatamento en el dia ${fechaDelDia}`
                        })
                        for (const apartmentoDelDia of apartamentos) {
                            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                                string: apartmentoDelDia.apartamentoIDV,
                                nombreCampo: `el identificador visual del apartamento dentro del dia ${fechaDelDia}.`,
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
                                const error = `Dentro el dia con fecha ${fechaDelDia} el tipo de descuento del ${apartamentoUI} (${apartamentoIDV}) solo puede ser porcentaje o cantidadFija`
                                throw new Error(error)
                            }

                            validadoresCompartidos.tipos.cadena({
                                string: apartmentoDelDia.descuentoTotal,
                                nombreCampo: `El campo descuentoTotal del dia ${fechaDelDia} en el ${apartamentoUI} (${apartamentoIDV}) solo puede ser una cadena con un numero con dos decimales separados por punto, tal que asi 0.00`,
                                filtro: "cadenaConNumerosConDosDecimales",
                                sePermiteVacio: "no",
                                impedirCero: "si",
                                devuelveUnTipoNumber: "no",
                                limpiezaEspaciosAlrededor: "si",
                            })
                        }
                    } else {
                        const error = "No se reconove subTipoDescuento, debe ser porDialDelRango o totalNetoPorRango: " + tipoDescuentoDelDia
                        throw new Error(error)
                    }
                }
            } else {
                const error = "No se reconoce subTipoDescuento, debe ser porDialDelRango o totalNetoPorRango"
                throw new Error(error)
            }
        } else {
            const error = "No se reconoce el tipo de Descuento, el tipo de descuento solo puede ser totalNetoApartamentoDedicado, totalNetoReserva o porRango"
            throw new Error(error)
        }
    } catch (error) {
        throw error
    }
}