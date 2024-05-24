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

        validadoresCompartidos.tipos.cadena({
            string: oferta.tipoOferta,
            nombreCampo: "El tipo de oferta",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const fechaEntrada_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: oferta.fechaInicio_ISO,
            nombreCampo: "La fecha inicio de la vigencia de la oferta"
        })
        const fechaSalida_ISO = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: oferta.fechaFin_ISO,
            nombreCampo: "La fecha fin de la vigencia de la oferta"
        })


        validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO
        })


        const condiciones = validadoresCompartidos.tipos.array({
            array: oferta.condiciones
        })
        const descuentos = validadoresCompartidos.tipos.array({
            array: oferta.descuentos
        })
        if (condiciones.length === 0) {
            const error = "Añade al menos una condiciona la oferta"
            throw error
        }
        if (descuentos.length === 0) {
            const error = "No hay especificado ningun descuento en la oferta"
            throw error
        }

        for (const condicion of condiciones) {

            const tipoCondicionIDV = condicion?.tipoCondicion
            if (tipoCondicionIDV === "conFechaEntradaEntreRango") {

                const fechaInicioRango_ISO = condicion?.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion?.fechaFinalRango_ISO
                if (!fechaInicioRango_ISO) {
                    const error = "En el tipo de condicion conFechaEntradaEntreRango no hay definida: " + fechaInicioRango_ISO
                    throw error
                }
                if (!fechaFinalRango_ISO) {
                    const error = "En el tipo de condicion conFechaEntradaEntreRango no hay definida: " + fechaFinalRango_ISO
                    throw error
                }
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha: fechaInicioRango_ISO,
                    nombreCampo: `La fecha de incio de la condicion ${tipoCondicionIDV}`
                })
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha: fechaFinalRango_ISO,
                    nombreCampo: `La fecha de final de la condicion ${tipoCondicionIDV}`
                })

                validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada_ISO: fechaInicioRango_ISO,
                    fechaSalida_ISO: fechaFinalRango_ISO
                })

            } else if (tipoCondicionIDV === "conFechaCreacionEntreRango") {


            } else if (tipoCondicionIDV === "porNumeroDeApartamentos") {

                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw error
                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.numeroDeApartamentos,
                    nombreCampo: "El campo numeroDeApartamentos en la condicion " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porApartamentosEspecificos") {

                const apartamentos = condicion.apartamentos
                validadoresCompartidos.tipos.array({
                    array: apartametnos
                })
                apartamentos.forEach(apartamento => {
                    const apartamentoIDV = apartamento.apartamentoIDV
                    const cantidad = apartamento.cantidad
                    const tipoDescuento = apartamento.tipoDescuento

                    validadoresCompartidos.tipos.cadena({
                        string: apartamentoIDV,
                        nombreCampo: "El campo apartamentoIDV dentro del array de apartamentos en la condicion del tipo porApartamentosDedicados",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
  
                });

            } else if (tipoCondicionIDV === "porDiasDeAntelacion") {
                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw error
                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.numeroDeDias,
                    nombreCampo: "El campo numeroDeDias en la condicion " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porDiasDeReserva") {
                const tipoConteo = condicion.tipoConteo
                if (tipoConteo !== "aPartirDe" && tipoConteo !== "numeroExacto") {
                    const error = `En la condiicon ${tipoCondicionIDV} el campo tipoConteo solo puede ser aPartirDe o numeroExacto`
                    throw error
                }
                validadoresCompartidos.tipos.cadena({
                    string: condicion.diasDeReserva,
                    nombreCampo: "El campo diasDeReserva en la condicion " + tipoCondicionIDV,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else if (tipoCondicionIDV === "porRangoDeFechas") {
                const fechaInicioRango_ISO = condicion?.fechaInicioRango_ISO
                const fechaFinalRango_ISO = condicion?.fechaFinalRango_ISO
                if (!fechaInicioRango_ISO) {
                    const error = "En el tipo de condicion porRangoDeFechas no hay definida: " + fechaInicioRango_ISO
                    throw error
                }
                if (!fechaFinalRango_ISO) {
                    const error = "En el tipo de condicion porRangoDeFechas no hay definida: " + fechaFinalRango_ISO
                    throw error
                }
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha: fechaInicioRango_ISO,
                    nombreCampo: `La fecha de incio de la condicion ${tipoCondicionIDV}`
                })
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha: fechaFinalRango_ISO,
                    nombreCampo: `La fecha de final de la condicion ${tipoCondicionIDV}`
                })
                validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada_ISO: fechaInicioRango_ISO,
                    fechaSalida_ISO: fechaFinalRango_ISO
                })
            } else {
                const error = "No se reconoce el tipo de la condiciones"
                throw error
            }
        }

        for (const descuento of descuentos) {

            const tipoDescuento = descuento.tipoDescuento
            if (tipoDescuento === "totalNetoApartamentoDedicado") {
                const apartamentos = validadoresCompartidos.tipos.array({
                    array: descuento.apartamentos
                })
                apartamentos.forEach((detallesApartamento) => {

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
                    validadoresCompartidos.tipos.cadena({
                        string: cantidad,
                        nombreCampo: `El campo cantidad en del apartamento ${apartamentoIDV} debe ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
                        filtro: "cadenaConNumerosEnteros",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })

                    if (tipoDescuento !== "pocentaje" && tipoDescuento !== "cantidadFija") {
                        const error = `En la descuentos, en el apartamento ${apartamentoIDV} el campo tipoDescuento solo puede ser pocentaje o cantidadFija`
                        throw error
                    }

                })

            } else if (tipoDescuento === "totalNetoReserva") {

                const tipoAplicacion = descuento.descuento
                const descuentoTotal = descuento.descuentoTotal

                if (tipoAplicacion !== "pocentaje" && tipoAplicacion !== "cantidadFija") {
                    const error = `En la descuentos, el campo tipoAplicacion solo puede ser pocentaje o cantidadFija`
                    throw error
                }

                validadoresCompartidos.tipos.cadena({
                    string: descuentoTotal,
                    nombreCampo: `El campo descuentoTotla solo puede ser una cadena con un numero don dos decimales separados por punto, tal que asi 0.00`,
                    filtro: "cadenaConNumerosEnteros",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })

            } else {
                const error = "No se reconoce el tipo de descuneto, el tipo de descuento solo puede ser totalNetoApartamentoDedicado o totalNetoReserva"
                throw error
            }

        }
    } catch (error) {
        throw error
    }

}