import { obtenerConfiguracionPorApartamentoIDV } from "../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"
export const validarObjetoOferta = async (oferta) => {

    try {
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

        validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: fechaEntrada,
            fechaSalida_ISO: fechaSalida,
            tipoVector: "igual"
        })

        const condiciones = validadoresCompartidos.tipos.array({
            array: oferta.condiciones,
            nombreCampo: "El array de condiciones"
        })
        const descuentos = validadoresCompartidos.tipos.objetoLiteral({
            objetoLiteral: oferta.descuentos,
            nombreCampo: "El objeto de descuentos"
        })
        if (condiciones.length === 0) {
            const error = "Añade al menos una condiciona la oferta"
            throw new Error(error)
        }

        for (const condicion of condiciones) {
            const tipoCondicionIDV = condicion?.tipoCondicion
            if (tipoCondicionIDV === "conFechaEntradaEntreRango") {
                const fechaInicioRango_ISO = condicion?.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion?.fechaFinalRango_ISO
                console.log("fi", fechaInicioRango_ISO, "ff", fechaFinalRango_ISO)
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

                validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada_ISO: fechaInicioRango_ISO,
                    fechaSalida_ISO: fechaFinalRango_ISO,
                    tipoVector: "diferente"
                })

            } else if (tipoCondicionIDV === "conFechaCreacionEntreRango") {
            } else if (tipoCondicionIDV === "porNumeroDeApartamentos") {

                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el tipoConteo solo puede ser aPartirDe o numeroExacto`
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

                const apartamentos = condicion.apartamentos
                validadoresCompartidos.tipos.array({
                    array: apartamentos,
                    nombreCampo: "Array de apartamento en la condicion de porApartamentosEspecificos",
                    filtro: "soloCadenasIDV",
                    noSePermitenDuplicados: "si"
                })
                for (const apartamento of apartamentos) {
                    const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                        string: apartamento,
                        nombreCampo: "El campo apartamentoIDV dentro del array de apartamentos en la condicion del tipo porApartamentosDedicados",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                    await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
                }


            } else if (tipoCondicionIDV === "porDiasDeAntelacion") {
                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
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
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw new Error(error)

                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.diasDeReserva,
                    nombreCampo: "El campo diasDeReserva en la condicion " + tipoCondicionIDV,
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
                validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada_ISO: fechaInicioRango_ISO,
                    fechaSalida_ISO: fechaFinalRango_ISO,
                    tipoVector: "diferente"

                })
            } else {
                const error = "No se reconoce el tipo de la condiciones"
                throw new Error(error)

            }
        }

        const tipoDescuento = descuentos.tipoDescuento
        console.log("d", tipoDescuento)
        if (tipoDescuento === "totalNetoApartamentoDedicado") {
            const apartamentos = validadoresCompartidos.tipos.array({
                array: descuentos.apartamentos,
                nombreCampo: "En desceuntos, en el totalNetoApartametnoDedicado, el array"
            })

            for (const detallesApartamento of apartamentos) {
                const apartamentoIDV = detallesApartamento.apartamentoIDV
                const cantidad = detallesApartamento.cantidad
                const tipoDescuento = detallesApartamento.tipoDescuento

                validadoresCompartidos.tipos.cadena({
                    string: apartamentoIDV,
                    nombreCampo: "el identificador visual del apartamento dentro de descuentos no tiene un formato esperado.",
                    filtro: "strictoIDV",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
                await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

                validadoresCompartidos.tipos.cadena({
                    string: cantidad,
                    nombreCampo: `El campo cantidad del ${apartamentoIDV} en la seccion de descuentos`,
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

                if (tipoDescuento !== "pocentaje" && tipoDescuento !== "cantidadFija") {
                    const error = `En la descuentos, en el apartamento ${apartamentoIDV} el campo tipoDescuento solo puede ser pocentaje o cantidadFija`
                    throw new Error(error)

                }
            }


        } else if (tipoDescuento === "totalNetoReserva") {

            const tipoAplicacion = descuentos.tipoAplicacion
            const descuentoTotal = descuentos.descuentoTotal

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

        } else if (tipoDescuento === "totalNetoPorRango") {


            const tipoAplicacion = descuentos.tipoAplicacion
            const descuentoTotal = descuentos.descuentoTotal

            if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                const error = `En la descuentos, el campo tipoAplicacion solo puede ser porcentaje o cantidadFija`
                throw new Error(error)
            }
            validadoresCompartidos.tipos.cadena({
                string: descuentoTotal,
                nombreCampo: `El campo descuentoTotal en ${tipoDescuento} solo puede ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })

        } else if (tipoDescuento === "porRango") {


            const fechaInicioRango_ISO = descuentos.fechaInicioRango_ISO
            const fechaFinalRango_ISO = descuentos.fechaFinalRango_ISO

            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaInicioRango_ISO,
                nombreCampo: `La fecha de incio de la condicion ${fechaInicioRango_ISO}`
            })
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaFinalRango_ISO,
                nombreCampo: `La fecha de final de la condicion ${fechaFinalRango_ISO}`
            })
            validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada_ISO: fechaInicioRango_ISO,
                fechaSalida_ISO: fechaFinalRango_ISO,
                tipoVector: "diferente"

            })

            const detallesDelDescuento = validadoresCompartidos.tipos.objetoLiteral({
                objetoLiteral: descuentos.detallesDelDescuento,
                nombreCampo: "El objeto de descuentos"
            })

            const tipoDelDescuentoPorRango = detallesDelDescuento.tipoDescuento
            if (tipoDelDescuentoPorRango === "totalNetoPorRango") {
                const tipoAplicacion = descuentos.tipoAplicacion
                const descuentoTotal = descuentos.descuentoTotal

                if (tipoAplicacion !== "porcentaje" && tipoAplicacion !== "cantidadFija") {
                    const error = `En ${tipoDelDescuentoPorRango} el tipo aplicacion del descuento solo puede ser porcentaje o cantidadFija`
                    throw new Error(error)
                }
                validadoresCompartidos.tipos.cadena({
                    string: descuentoTotal,
                    nombreCampo: `El campo descuentoTotal en ${tipoDelDescuentoPorRango} del dia ${fechaDelDia} solo puede ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    impedirCero: "si",
                    devuelveUnTipoNumber: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
            }

            if (tipoDelDescuentoPorRango === "porDiasDelRango") {

                const descuentoPorDias = validadoresCompartidos.tipos.array({
                    array: detallesDelDescuento.descuentoPorDias,
                    nombreCampo: "El array de descuentoPorDias"
                })


                for (const dia of descuentoPorDias) {
                    const tipoDescuentoDelDia = dia.tipoDescuento
                    const fechaDelDia = await validadoresCompartidos.fechas.validarFecha_ISO({
                        fecha_ISO: dia.fecha,
                        nombreCampo: `La fecha de final de la condicion ${tipoCondicionIDV}`
                    })
                    const fechaEnRango = validadoresCompartidos.fechas.fechaEnRango({
                        fechaAComprobrarDentroDelRango: fechaDelDia,
                        fechaInicioRango_ISO: fechaInicioRango_ISO,
                        fechaFinRango_ISO: fechaFinalRango_ISO,
                    })
                    if (!fechaEnRango) {
                        const error = `Dentro el dia con fecha ${fechaDelDia} esta fuera del rango entre ${fechaInicioRango_ISO} y ${fechaFinalRango_ISO}`
                        throw new Error(error)
                    }

                    if (tipoDescuentoDelDia !== "netoPorDia" && tipoDescuentoDelDia !== "netoPorApartamentoDelDia") {
                        const error = `Dentro el dia con fecha ${fechaDelDia} el tipo de descuento del dia solo puede ser netoPorDia o netoPorApartamentoDelDia`
                        throw new Error(error)
                    }


                    if (tipoDescuentoDelDia === "netoPorApartamentoDelDia") {

                        const fechaDelDia = await validadoresCompartidos.fechas.validarFecha_ISO({
                            fecha_ISO: dia.fecha,
                            nombreCampo: `La fecha de final de la condicion ${tipoCondicionIDV}`
                        })
                        const fechaEnRango = validadoresCompartidos.fechas.fechaEnRango({
                            fechaAComprobrarDentroDelRango: fechaDelDia,
                            fechaInicioRango_ISO: fechaInicioRango_ISO,
                            fechaFinRango_ISO: fechaFinalRango_ISO,
                        })
                        if (!fechaEnRango) {
                            const error = `Dentro el dia con fecha ${fechaDelDia} esta fuera del rango entre ${fechaInicioRango_ISO} y ${fechaFinalRango_ISO}`
                            throw new Error(error)
                        }

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
                            const tipoAplicacionDentroDelDia = apartmentoDelDia.tipoAplicacion
                            if (tipoAplicacionDentroDelDia !== "netoPorDia" && tipoAplicacionDentroDelDia !== "netoPorApartamentoDelDia") {
                                const error = `Dentro el dia con fecha ${fechaDelDia} el tipo de descuento del ${apartamentoIDV} dia solo puede ser netoPorDia o netoPorApartamentoDelDia`
                                throw new Error(error)
                            }

                            validadoresCompartidos.tipos.cadena({
                                string: apartmentoDelDia.descuentoTotla,
                                nombreCampo: `El campo descuentoTotal del dia ${fechaDelDia} en el apartamento ${apartamentoIDV} solo puede ser una cadena con un numero con dos decimales separados por punto, tal que asi 0.00`,
                                filtro: "cadenaConNumerosConDosDecimales",
                                sePermiteVacio: "no",
                                impedirCero: "si",
                                devuelveUnTipoNumber: "no",
                                limpiezaEspaciosAlrededor: "si",
                            })

                        }


                    }

                }

            }

        } else {
            const error = "No se reconoce el tipo de descuneto, el tipo de descuento solo puede ser totalNetoApartamentoDedicado, totalNetoReserva o porRango"
            throw new Error(error)
        }

    } catch (error) {
        throw error
    }

}