import Decimal from 'decimal.js';
import { codigoZonaHoraria } from '../codigoZonaHoraria.mjs';
import { DateTime } from 'luxon';
import { conexion } from '../../componentes/db.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
Decimal.set({ precision: 50 });
const aplicarOfertas = async (reservaPrecio) => {
    try {
        const fechaEntradaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reservaPrecio.fechas.entrada)).fecha_ISO
        const fechaSalidaReserva_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(reservaPrecio.fechas.salida)).fecha_ISO
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActualCompletaTZ = tiempoZH.toISO()
        const fechaActualTZ = tiempoZH.toISODate()
        const estadoOfertaActivado = "activada"
        // Tener los apartmetnos junto a su precio neto final
        const apartamentos = reservaPrecio.desgloseFinanciero.totalesPorApartamento
        // Numero de apartamento e apartmentosIDV
        const numeroApartamentos = apartamentos.length;
        const apartamentosIDV = []
        for (const detallesPorApartamento of apartamentos) {
            apartamentosIDV.push(detallesPorApartamento.apartamentoIDV)
        }
        const desglosePorApartamento_Objeto = {}
        // Tener el neto total reserva
        const totalReservaNeto = reservaPrecio.desgloseFinanciero.totales.totalReservaNeto
        const totalReservaNetoDecimal = new Decimal(totalReservaNeto)
        // Numero de noches de la reserva
        // Numero de dias de antelacion
        const ofertasEncontrada = []
        const consultaOfertasTipo1 = `
        SELECT 
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
        "simboloNumero",
        "descuentoAplicadoA",
        "estadoOferta",
        "tipoOferta",
        "cantidad",
        numero,
        "tipoDescuento",
        "nombreOferta"
        FROM ofertas
        WHERE $1 BETWEEN "fechaInicio" AND "fechaFin"
        AND "estadoOferta" = $3
        AND "tipoOferta" = ANY($2::text[]);`;
        // Mucho ojo en las ofertas de tipo1 por que se activan revisando la fecha actual, es decir la fecha de cuando se realiza la reserva y no las fechas de inicio y fin de la reserva, eso se revisa mas adelante
        // Acuerdate por que esta parte es un poco contraintuitiva.
        const ofertasTipo1 = [
            "porNumeroDeApartamentos",
            "porApartamentosEspecificos",
            "porDiasDeAntelacion",
            "porDiasDeReserva"
        ];
        const resuelveConsultaOfertasTipo1 = await conexion.query(consultaOfertasTipo1, [fechaActualTZ, ofertasTipo1, estadoOfertaActivado]);
        if (resuelveConsultaOfertasTipo1.rowCount > 0) {
            resuelveConsultaOfertasTipo1.rows.map((oferta) => {
                ofertasEncontrada.push(oferta)
            })
        }
        const ofertasTipo2 = "porRangoDeFechas"
        const consultaOfertasTipo2 = `
        SELECT 
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
        "simboloNumero",
        "estadoOferta",
        "tipoOferta",
        "cantidad",
        numero,
        "tipoDescuento",
        "nombreOferta"
        FROM ofertas
        WHERE ("fechaInicio" <= $1 AND "fechaFin" >= $2)
        AND "estadoOferta" = $4 
        AND "tipoOferta" = $3;
        `
        const resuelveConsultaOfertasTipo2 = await conexion.query(consultaOfertasTipo2, [fechaSalidaReserva_ISO, fechaEntradaReserva_ISO, ofertasTipo2, estadoOfertaActivado]);
        if (resuelveConsultaOfertasTipo2.rowCount > 0) {
            const ofertasTipo2Encontradas = resuelveConsultaOfertasTipo2.rows
            ofertasTipo2Encontradas.map((oferta) => {
                ofertasEncontrada.push(oferta)
            })
        }
        const ofertasQueSeDebeAplicar = []
        for (const detalleOferta of ofertasEncontrada) {
            const tipoOferta = detalleOferta.tipoOferta
            if (tipoOferta === "porNumeroDeApartamentos") {
                const simboloNumero = detalleOferta.simboloNumero
                const numero = detalleOferta.numero
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaEstructuraFinal = {
                    nombreOferta: nombreOferta,
                    tipoDescuento: tipoDescuento,
                    tipoOferta: tipoOferta,
                    cantidad: cantidad
                }
                if (simboloNumero === "aPartirDe" && numero <= numeroApartamentos) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} o mas apartamentos`
                    ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                }
                if (simboloNumero === "numeroExacto" && numero === numeroApartamentos) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} apartamentos`
                    ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                }
            }
            if (tipoOferta === "porDiasDeAntelacion") {
                const simboloNumero = detalleOferta.simboloNumero
                const numero = detalleOferta.numero
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaEstructuraFinal = {
                    nombreOferta: nombreOferta,
                    tipoDescuento: tipoDescuento,
                    tipoOferta: tipoOferta,
                    cantidad: cantidad
                }
                // Calcula la diferencia en milisegundos
                const fechaEntrada_Objeto = DateTime.fromISO(fechaEntradaReserva_ISO, { zone: codigoZonaHoraria.zonaHoraria });
                const diasAntelacion = Math.floor(fechaEntrada_Objeto.diff(tiempoZH, 'days').days);
                if (simboloNumero === "aPartirDe" && numero <= diasAntelacion) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de antelacion o mas `
                    ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                }
                if (simboloNumero === "numeroExacto" && numero === diasAntelacion) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de antelacion concretamente`
                    ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                }
            }
            if (tipoOferta === "porDiasDeReserva") {
                const simboloNumero = detalleOferta.simboloNumero
                const numero = detalleOferta.numero
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaEstructuraFinal = {
                    nombreOferta: nombreOferta,
                    tipoDescuento: tipoDescuento,
                    tipoOferta: tipoOferta,
                    cantidad: cantidad
                }
                const fechaEntradaReservaObjeto = DateTime.fromISO(fechaEntradaReserva_ISO);
                const fechaSalidaReservaObjeto = DateTime.fromISO(fechaSalidaReserva_ISO);
                const diasDeLaReserva = Math.floor(fechaSalidaReservaObjeto.diff(fechaEntradaReservaObjeto, 'days').days);
                if (simboloNumero === "aPartirDe" && numero <= diasDeLaReserva) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de duracion o mas`
                    ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                }
                if (simboloNumero === "numeroExacto" && numero === diasDeLaReserva) {
                    ofertaEstructuraFinal.definicion = `Oferta aplicada a reserva con ${numero} dias de duracion concretamente`
                    ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                }
            }
            const fusionaArrayConComaYUltimaConYGriega = (array) => {
                return array.length <= 1 ? array.join("") : `${array.slice(0, -1).join(", ")} y ${array.slice(-1)}`;
            }
            if (tipoOferta === "porApartamentosEspecificos") {
                const nombreOferta = detalleOferta.nombreOferta
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = detalleOferta.cantidad
                const ofertaUID = detalleOferta.uid
                const descuentoAplicadoA = detalleOferta.descuentoAplicadoA
                const apartamentosDedicadosOferta = []
                const consultaApartamentosEspecificos = `
                SELECT  
                apartamento AS "apartamentoIDV",
                "tipoDescuento",
                cantidad
                FROM "ofertasApartamentos"
                WHERE oferta = $1;
                `
                const resuelveConsultaApartamentosEspecificos = await conexion.query(consultaApartamentosEspecificos, [ofertaUID]);
                const apartamentosDedicados = resuelveConsultaApartamentosEspecificos.rows
                const apartamentosIDVOferta = []
                const apartamentosUIOferta = []
                for (const detallesApartamentoDedicado of apartamentosDedicados) {
                    const apartamentoIDV = detallesApartamentoDedicado.apartamentoIDV
                    const apartamentoUI = await validadoresCompartidos.reservas.resolverNombreApartamento(apartamentoIDV)
                    const tipoDescuento = detallesApartamentoDedicado.tipoDescuento
                    const cantidad = detallesApartamentoDedicado.cantidad
                    const estructura = {
                        apartamentoIDV: apartamentoIDV,
                        apartamentoUI: apartamentoUI,
                        tipoDescuento: tipoDescuento,
                        cantidad: cantidad,
                    }
                    apartamentosDedicadosOferta.push(estructura)
                    apartamentosIDVOferta.push(apartamentoIDV)
                    apartamentosUIOferta.push(apartamentoUI)
                }
                const compararArraysStrings = (array1, array2) => {
                    return array2.every(item => array1.includes(item));
                };
                const resultadoDeLaCompracion = compararArraysStrings(apartamentosIDV, apartamentosIDVOferta);
                if (resultadoDeLaCompracion) {
                    const ofertaEstructuraFinal = {
                        nombreOferta: nombreOferta,
                        tipoOferta: tipoOferta,
                    }
                    ofertaEstructuraFinal.descuentoAplicadoA = descuentoAplicadoA
                    if (descuentoAplicadoA === "totalNetoReserva") {
                        ofertaEstructuraFinal.tipoDescuento = tipoDescuento
                        ofertaEstructuraFinal.cantidad = cantidad
                        const formateoApartamentos = fusionaArrayConComaYUltimaConYGriega(apartamentosUIOferta);
                        let definicionUI
                        if (apartamentosUIOferta.length > 1) {
                            definicionUI = `Oferta aplicada al neto de la reserva por contener los apartamentos: ${formateoApartamentos}`
                        }
                        if (apartamentosUIOferta.length === 1) {
                            definicionUI = `Oferta aplicada al neto de la reserva por contener el apartamento: ${formateoApartamentos}`
                        }
                        ofertaEstructuraFinal.definicion = definicionUI
                        ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                    }
                    if (descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                        ofertaEstructuraFinal.definicion = `Oferta aplicada con descuentos indivudales por apartamento. Estos descuentos se aplican al neto de cada apartamamento por separado`
                        const arrayApartamentos = []
                        for (const detalleApartamento of apartamentosDedicadosOferta) {
                            const apartamentoIDV = detalleApartamento.apartamentoIDV
                            const apartamentoUI = detalleApartamento.apartamentoUI
                            const tipoDescuentoApartamento = detalleApartamento.tipoDescuento
                            const cantidadApartamento = detalleApartamento.cantidad
                            let esquemaApartamento = {
                                apartamentoIDV: apartamentoIDV,
                                apartamentoUI: apartamentoUI,
                                tipoDescuento: tipoDescuentoApartamento,
                                cantidad: cantidadApartamento
                            }
                            arrayApartamentos.push(esquemaApartamento)
                        }
                        ofertaEstructuraFinal.apartamentos = arrayApartamentos
                        ofertasQueSeDebeAplicar.push(ofertaEstructuraFinal)
                    }
                }
            }
        }
        const detallePorDiaPreProcesdo = reservaPrecio.desgloseFinanciero.totalesPorNoche
        const ofertasPorAplicar = [...ofertasQueSeDebeAplicar]
        const selectorOfertasApartamentosEspecificos = []
        ofertasPorAplicar.map((oferta) => {
            if (oferta.tipoOferta === "porApartamentosEspecificos") {
                selectorOfertasApartamentosEspecificos.push(oferta)
            }
        })
        for (const detalleDia of detallePorDiaPreProcesdo) {
            const fechaDia = detalleDia.fechaDiaConNoche
            const apartamentosDia = detalleDia.apartamentos
            apartamentosDia.map((apartamentoPorDia) => {
                const apartamentoIDVPorDia = apartamentoPorDia.apartamentoIDV
                const apartamentoPrecioBaseNoche = apartamentoPorDia.precioBaseNoche
                const acumuladorDeDescuentos = {
                    cantidadFija: 0,
                    porcentaje: 0
                }
                for (const detalleOferta of selectorOfertasApartamentosEspecificos) {
                    const apartamentosEspecificosEnOferta = detalleOferta.apartamentos ? detalleOferta.apartamentos : []
                    for (const apartamentoEspecifico of apartamentosEspecificosEnOferta) {
                        const apartamentosIDVOferta = apartamentoEspecifico.apartamentoIDV
                        const tipoDescuento = apartamentoEspecifico.tipoDescuento
                        const cantidad = apartamentoEspecifico.cantidad
                        if (apartamentoIDVPorDia === apartamentosIDVOferta) {
                            if (tipoDescuento === "porcentaje") {
                                const porcentaje = new Decimal(acumuladorDeDescuentos.porcentaje)
                                acumuladorDeDescuentos.porcentaje = porcentaje.plus(cantidad)
                            }
                            if (tipoDescuento === "cantidadFija") {
                                const cantidadFija = new Decimal(acumuladorDeDescuentos.cantidadFija)
                                acumuladorDeDescuentos.cantidadFija = cantidadFija.plus(cantidad)
                            }
                        }
                    }
                }
                const precioNetoNocheConOferta = apartamentoPrecioBaseNoche;
                const precioBaseInicial = new Decimal(precioNetoNocheConOferta)
                const cantidadTotal = acumuladorDeDescuentos.cantidadFija
                const precioBaseFase1 = precioBaseInicial.minus(cantidadTotal)
                // precioBaseFase1 = new Decimal(precioBaseFase1)
                const porcentajeTotal = acumuladorDeDescuentos.porcentaje
                //precioNetoNocheConOferta = precioNetoNocheConOferta - ((porcentajeTotal / 100) * precioNetoNocheConOferta)
                const precioBaseFase2 = precioBaseFase1.minus(precioBaseFase1.times(porcentajeTotal).dividedBy(100));
                if (acumuladorDeDescuentos.cantidadFija > 0 && acumuladorDeDescuentos.porcentaje > 0) {
                    apartamentoPorDia.precioNetoNocheConOfertaNuevo = precioBaseFase2.toFixed(2)
                }
            })
        }
        const apartmamentoaFormatoObtenerTotal = {}
        detallePorDiaPreProcesdo.map((detalleApartamento) => {
        })
        
        const comprobarFechaEnRango = (fechaAComprobar_ISO, fechaInicio_ISO, fechaFin_ISO) => {
            const fechaObjetoAComprobar = new Date(fechaAComprobar_ISO);
            const fechaObjetoInicio = new Date(fechaInicio_ISO);
            const fechaObjetoFin = new Date(fechaFin_ISO);
            return fechaObjetoAComprobar >= fechaObjetoInicio && fechaObjetoAComprobar <= fechaObjetoFin;
        }
        const obtenerTotalPorDia = (fecha) => {
            const detalleDia = detallePorDiaPreProcesdo[fecha]
            const apartamentosPorDia = detalleDia.apartamentos
            let totalNetoDia = 0
            for (const detalleApartamento of apartamentosPorDia) {
                const precioNetoNoche = new Decimal(detalleApartamento.precioNetoNoche)
                totalNetoDia = precioNetoNoche.plus(totalNetoDia)
            }
            return totalNetoDia
        }
        const tipoOfertaPorRangoDeFechas = "porRangoDeFechas"
        const seleccionarOfertaPorRAngoDeFecha = `
        SELECT 
        uid,
        to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio_Humano", 
        to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin_Humano", 
        to_char("fechaInicio", 'YYYY-MM-DD') as "fechaInicio_ISO", 
        to_char("fechaFin", 'YYYY-MM-DD') as "fechaFin_ISO", 
        "tipoOferta",
        "cantidad",
        "tipoDescuento",
        "descuentoAplicadoA",
        "nombreOferta"
        FROM ofertas 
        WHERE "fechaInicio" <= $1::DATE AND "fechaFin" >= $2::DATE AND "estadoOferta" = $3 AND "tipoOferta" = $4;`
        const resuelveOfertasPorRangoDeFecha = await conexion.query(seleccionarOfertaPorRAngoDeFecha, [fechaSalidaReserva_ISO, fechaEntradaReserva_ISO, estadoOfertaActivado, tipoOfertaPorRangoDeFechas])
        const diasPorProcesarPorOfertasPorRangoDeFechas = {}
        // Inicio oferta por rango fecha
        if (resuelveOfertasPorRangoDeFecha.rowCount > 0) {
            const ofertasPorRangoDeFecha = resuelveOfertasPorRangoDeFecha.rows
            
            // Revisar esto
            for (const detalleDia of detallePorDiaPreProcesdo) {
                const fechaDiaArreglo = detalleDia.fechaDiaConNoche.split("/")
                const fechaDia_ISO = `${fechaDiaArreglo[2]}-${fechaDiaArreglo[1]}-${fechaDiaArreglo[0]}`
                ofertasPorRangoDeFecha.map((detalleOfertaRangoPorFecha) => {
                    const uidOferta = detalleOfertaRangoPorFecha.uid
                    const fechaInicio_ISO = detalleOfertaRangoPorFecha.fechaInicio_ISO
                    const fechaFin_ISO = detalleOfertaRangoPorFecha.fechaFin_ISO
                    if (!diasPorProcesarPorOfertasPorRangoDeFechas[uidOferta]) {
                        diasPorProcesarPorOfertasPorRangoDeFechas[uidOferta] = {}
                        diasPorProcesarPorOfertasPorRangoDeFechas[uidOferta].diasAfectados = []
                    }
                    if (comprobarFechaEnRango(fechaDia_ISO, fechaInicio_ISO, fechaFin_ISO)) {
                        const detalleDiaPorProcesar = {
                            dia: fechaDia_ISO,
                            totalNetoDiaSinOferta: obtenerTotalPorDia(fechaDia_ISO),
                            //totalNetoDiaConOferta: null
                        }
                        diasPorProcesarPorOfertasPorRangoDeFechas[uidOferta].diasAfectados.push(detalleDiaPorProcesar)
                    }
                })
                // Comporbra que el dia este, esté dentro de algun rango de oferta,
                // Si es asi poner en el acumulador
            }
            // Preformateo de ofertas de rangpoPorFecha
            const ofertasPorRangoFechaFormatoFinalParaProcesamiento = {}
            ofertasPorRangoDeFecha.map((detalleOfertaPorRangoFecha) => {
                const uidOferta = detalleOfertaPorRangoFecha.uid
                const fechaInicio = detalleOfertaPorRangoFecha.fechaInicio_Humano
                const fechaFin = detalleOfertaPorRangoFecha.fechaFin_Humano
                const tipoOferta = detalleOfertaPorRangoFecha.tipoOferta
                const cantidad = detalleOfertaPorRangoFecha.cantidad
                const tipoDescuento = detalleOfertaPorRangoFecha.tipoDescuento
                const nombreOferta = detalleOfertaPorRangoFecha.nombreOferta
                const definicion = `Oferta aplicada a los dias que estan dentro del rango de la oferta. El rango de esta oferta empieza el ${fechaInicio} y acaba ${fechaFin}. Los dia de las reserva que esten dentro del rango recibiran el descuento.`
                const formatoFinalFechaOfertaIndividual = {
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin,
                    tipoOferta: tipoOferta,
                    cantidad: cantidad,
                    tipoDescuento: tipoDescuento,
                    nombreOferta: nombreOferta,
                    definicion: definicion,
                    netoRangoSinOferta: null,
                    netoRangoConOferta: null,
                    diasAfectados: null
                }
                ofertasPorRangoFechaFormatoFinalParaProcesamiento[uidOferta] = formatoFinalFechaOfertaIndividual
            })
            for (const detalleOfertaPorRango of Object.entries(ofertasPorRangoFechaFormatoFinalParaProcesamiento)) {
                const contenedorOferta = detalleOfertaPorRango[1]
                const uidOferta = detalleOfertaPorRango[0]
                const diasAfectados = diasPorProcesarPorOfertasPorRangoDeFechas[uidOferta].diasAfectados
                detalleOfertaPorRango[1].diasAfectados = diasAfectados
                ofertasQueSeDebeAplicar.push(contenedorOferta)
                const tipoDescuento = detalleOfertaPorRango[1].tipoDescuento
            }
            for (const detalleOfertaPorRango of Object.entries(ofertasPorRangoFechaFormatoFinalParaProcesamiento)) {
                const contenedorOferta = detalleOfertaPorRango[1]
                const uidOferta = detalleOfertaPorRango[0]
                const diasAfectados = diasPorProcesarPorOfertasPorRangoDeFechas[uidOferta].diasAfectados
                let totalRangoNetoSinOferta = 0
                let totalRangoNetoConOferta = 0
                const tipoDescuento = detalleOfertaPorRango[1].tipoDescuento
                const cantidad = new Decimal(detalleOfertaPorRango[1].cantidad)
                let descuentoFinalPorDia
                
                for (const diaAfectado of diasAfectados) {
                    const totalNetoDiaSinOferta = diaAfectado.totalNetoDiaSinOferta
                    totalRangoNetoSinOferta = totalRangoNetoSinOferta + Number(totalNetoDiaSinOferta)
                    diaAfectado.totalNetoDiaConOferta = null
                }
                if (tipoDescuento === "porcentaje") {
                    const descuentoFinal = cantidad.dividedBy(100).times(totalRangoNetoSinOferta);
                    descuentoFinalPorDia = descuentoFinal.toFixed(2)
                }
                if (tipoDescuento === "cantidadFija") {
                    descuentoFinalPorDia = cantidad
                }
                detalleOfertaPorRango[1].descuentoAplicado = descuentoFinalPorDia
                detalleOfertaPorRango[1].netoRangoSinOferta = totalRangoNetoSinOferta.toFixed(2)
                detalleOfertaPorRango[1].netoRangoConOferta = new Decimal(totalRangoNetoSinOferta)
                    .minus(descuentoFinalPorDia)
                    .isPositive() ? new Decimal(totalRangoNetoSinOferta)
                        .minus(descuentoFinalPorDia)
                        .toString() : "0.00"
                // Calcular le neto por dia con ofeta
                for (const diaAfectado of diasAfectados) {
                    const totalNetoDiaSinOferta = new Decimal(diaAfectado.totalNetoDiaSinOferta)
                    let totalNetoDiaConOferta
                    if (tipoDescuento === "porcentaje") {
                        const descuentoFinal = cantidad.dividedBy(100).times(totalNetoDiaSinOferta);
                        totalNetoDiaConOferta = totalNetoDiaSinOferta.minus(descuentoFinal)
                    }
                    if (tipoDescuento === "cantidadFija") {
                        totalNetoDiaConOferta = totalNetoDiaSinOferta.minus(cantidad)
                    }
                    const conntrolCeroTtoal = totalNetoDiaConOferta.isPositive() ? totalNetoDiaConOferta.toFixed(2) : "0.00"
                    diaAfectado.totalNetoDiaConOferta = conntrolCeroTtoal
                }
                
            }
        }
        let sumaDescuentos = 0
        // Extraer por perfil de oferta el dato la renderizado para hacer una resta final al neto que ya esta separado del neto inicio o sin oferta
        ofertasQueSeDebeAplicar.map((detalleOferta) => {
            const tipoOferta = detalleOferta.tipoOferta
            if (tipoOferta === "porDiasDeAntelacion") {
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = new Decimal(detalleOferta.cantidad)
                let descuentoRenderizado = 0
                if (tipoDescuento === "cantidadFija") {
                    sumaDescuentos = cantidad.plus(sumaDescuentos)
                    descuentoRenderizado = cantidad
                }
                if (tipoDescuento === "porcentaje") {
                    sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                    descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
            if (tipoOferta === "porDiasDeReserva") {
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = new Decimal(detalleOferta.cantidad)
                let descuentoRenderizado = 0
                if (tipoDescuento === "cantidadFija") {
                    sumaDescuentos = sumaDescuentos + cantidad
                    descuentoRenderizado = cantidad
                }
                if (tipoDescuento === "porcentaje") {
                    sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                    descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
            if (tipoOferta === "porNumeroDeApartamentos") {
                const tipoDescuento = detalleOferta.tipoDescuento
                const cantidad = new Decimal(detalleOferta.cantidad)
                let descuentoRenderizado = 0
                if (tipoDescuento === "cantidadFija") {
                    sumaDescuentos = cantidad.plus(sumaDescuentos)
                    descuentoRenderizado = cantidad
                }
                if (tipoDescuento === "porcentaje") {
                    sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                    descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
            if (tipoOferta === "porRangoDeFechas") {
                const descuentoAplicado = new Decimal(detalleOferta.descuentoAplicado)
                sumaDescuentos = descuentoAplicado.plus(sumaDescuentos)
                detalleOferta.descuentoRenderizado = descuentoAplicado.toFixed(2)
            }
            if (tipoOferta === "porApartamentosEspecificos") {
                
                const apartamentosEspecificos = detalleOferta.apartamentos ? detalleOferta.apartamentos : []
                let descuentoRenderizado = 0
                const descuentoAplicadoA = detalleOferta.descuentoAplicadoA
                if (descuentoAplicadoA === "totalNetoReserva") {
                    const tipoDescuento = detalleOferta.tipoDescuento
                    const cantidad = new Decimal(detalleOferta.cantidad)
                    if (tipoDescuento === "cantidadFija") {
                        sumaDescuentos = cantidad.plus(sumaDescuentos)
                        descuentoRenderizado = cantidad
                    }
                    if (tipoDescuento === "porcentaje") {
                        sumaDescuentos = cantidad.dividedBy(100).times(totalReservaNetoDecimal).plus(sumaDescuentos);
                        descuentoRenderizado = cantidad.dividedBy(100).times(totalReservaNetoDecimal);
                    }
                    detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
                }
                if (descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                    for (const detalleApartamento of apartamentosEspecificos) {
                        const apartamentoIDV = detalleApartamento.apartamentoIDV
                        const tipoDescuento = detalleApartamento.tipoDescuento
                        const cantidad = new Decimal(detalleApartamento.cantidad)
                        reservaPrecio.desgloseFinanciero.totalesPorApartamento.map((detallesDelApartamento) => {
                            desglosePorApartamento_Objeto[detallesDelApartamento.apartamentoIDV] = detallesDelApartamento
                            //return desglosePorApartamento_Objeto
                        })
                        
                        const totalNetoApartamento = new Decimal(desglosePorApartamento_Objeto[apartamentoIDV].totalNetoRango)
                        let descuentoRenderizadoPorApartamento = 0
                        if (tipoDescuento === "cantidadFija") {
                            sumaDescuentos = cantidad.plus(sumaDescuentos)
                            descuentoRenderizadoPorApartamento = cantidad
                        }
                        if (tipoDescuento === "porcentaje") {
                            sumaDescuentos = cantidad.dividedBy(100).times(totalNetoApartamento).plus(sumaDescuentos)
                            descuentoRenderizadoPorApartamento = cantidad.dividedBy(100).times(totalNetoApartamento)
                        }
                        descuentoRenderizadoPorApartamento = new Decimal(descuentoRenderizadoPorApartamento)
                        descuentoRenderizado = descuentoRenderizadoPorApartamento.plus(descuentoRenderizado)
                        detalleApartamento.descuentoRenderizadoPorApartamento = descuentoRenderizadoPorApartamento.toFixed(2)
                    }
                }
                detalleOferta.descuentoRenderizado = descuentoRenderizado.toFixed(2)
            }
        })
        reservaPrecio.desgloseFinanciero.totales.totalDescuentosAplicados = new Decimal(sumaDescuentos).toFixed(2).toString()
        reservaPrecio.desgloseFinanciero.totales.totalReservaNeto = (totalReservaNetoDecimal.minus(sumaDescuentos)).isPositive() ? totalReservaNetoDecimal.minus(sumaDescuentos).toString() : "0.00"
        return ofertasQueSeDebeAplicar
    } catch (error) {
        throw error
    }
}
export {
    aplicarOfertas
}