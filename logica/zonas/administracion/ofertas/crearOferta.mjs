import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerOfertasPorNombreUI } from "../../../repositorio/ofertas/obtenerOfertasPorNombreUI.mjs";
import { insertarOferta } from "../../../repositorio/ofertas/insertarOferta.mjs";
import { validarApartamentos } from "../../../sistema/ofertas/validarApartamentos.mjs";
import { insertarApartamentosEnOferta } from "../../../repositorio/ofertas/insertarApartamentosEnOferta.mjs";
import { validadoresLocales } from "../../../sistema/ofertas/validadoresLocales.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const crearOferta = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const nombreOferta = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreOferta,
            nombreCampo: "El campo del nombre de la oferta",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const fechaInicio_ISO = entrada.body.fechaInicio_ISO;
        const fechaFin_ISO = entrada.body.fechaFin_ISO;
        const tipoOferta = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoOferta,
            nombreCampo: "El tipo de oferta",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const tipoDescuento = entrada.body.tipoDescuento ? entrada.body.tipoDescuento : null;
        const cantidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.cantidad,
            nombreCampo: "El campo cantidad",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const contextoAplicacion = entrada.body.contextoAplicacion;
        const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados;
        const simboloNumero = entrada.body.simboloNumero;
        const numero = entrada.body.numero;

        await validadoresCompartidos.fechas.validarFecha_ISO(fechaInicio_ISO)
        await validadoresCompartidos.fechas.validarFecha_ISO(fechaFin_ISO)
        validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: fechaInicio_ISO,
            fechaSalida_ISO: fechaFin_ISO
        })


        // Validar nombre unico oferta
        const ofertasPorNombre = await obtenerOfertasPorNombreUI(nombreOferta)
        if (ofertasPorNombre.length > 0) {
            const error = "Ya existe un nombre de oferta exactamente igual a este, por favor elige otro nombre para esta oferta con el fin de evitar confusiones";
            throw new Error(error);
        }
        // OJO AQUI CON TODO - Selectores y funciones!!

        // PQHE
        // if (tipoDescuento === "precioEstablecido") {
        //     const controlPrecioEstablecido = `
        //                         SELECT 
        //                         *
        //                         FROM ofertas
        //                         WHERE ("fechaInicio" <= $1 AND "fechaFin" >= $2) AND "tipoDescuento" = $3;
        //                         `;
        //     await conexion.query(controlPrecioEstablecido, [fechaInicio_ISO, fechaFin_ISO, tipoDescuento]);
        // }
    
        
        const ok = {
            ok: "Se ha creado la oferta",
            ofertaUID: null
        }
        await campoDeTransaccion("iniciar")
        if (tipoOferta === "porNumeroDeApartamentos") {
            validadoresLocales.simboloNumero(simboloNumero);
            validadoresLocales.numero(numero);
            validadoresLocales.tipoDescuento(tipoDescuento);
            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                simboloNumero: simboloNumero,
                numero: numero,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            const resolutor = await insertarOferta(oferta);
            salida.json(resolutor);
        } else if (tipoOferta === "porApartamentosEspecificos") {

            validadoresLocales.contextoAplicacion(contextoAplicacion);
            if (contextoAplicacion === "totalNetoReserva") {
                validadoresLocales.tipoDescuento(tipoDescuento);
                validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            }

            const apartamentosPorValidar = {
                apartamentos: apartamentosSeleccionados,
                contextoAplicacion: contextoAplicacion
            }
            await validarApartamentos(apartamentosPorValidar)

            if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                cantidad = null;
            }
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            const resolutor = await insertarOferta(oferta);
            const nuevoUIDOferta = resolutor.nuevoUIDOferta;

            const dataApartamentos = {
                ofertaUID: nuevoUIDOferta,
                apartamentos: apartamentosSeleccionados,
                contextoAplicacion: contextoAplicacion
            }
            await insertarApartamentosEnOferta(dataApartamentos)
            ok.ofertaUID = nuevoUIDOferta

        } else if (tipoOferta === "porDiasDeAntelacion") {
            validadoresLocales.simboloNumero(simboloNumero);
            validadoresLocales.numero(numero);
            validadoresLocales.tipoDescuento(tipoDescuento);
            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                simboloNumero: simboloNumero,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                numero: numero,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            ok.ofertaUID = await insertarOferta(oferta);

        } else if (tipoOferta === "porDiasDeReserva") {
            validadoresLocales.simboloNumero(simboloNumero);
            validadoresLocales.numero(numero);
            validadoresLocales.tipoDescuento(tipoDescuento);
            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            //    simboloNumero = entrada.body.simboloNumero
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                simboloNumero: simboloNumero,
                numero: numero,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            ok.ofertaUID = await insertarOferta(oferta);

        } else if (tipoOferta === "porRangoDeFechas") {
            validadoresLocales.tipoDescuento(tipoDescuento);
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            ok.ofertaUID = await insertarOferta(oferta);
        } else {
            const error = "No se reconoce el tipo de oferta";
            throw new Error(error);
        }
        await campoDeTransaccion("confirmar")
        salida.json(ok);

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}