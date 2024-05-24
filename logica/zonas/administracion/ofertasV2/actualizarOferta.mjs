import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerOfertaConApartamentos } from "../../../sistema/ofertas/obtenerOfertaConApartamentos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { Mutex } from "async-mutex";

import { obtenerOferatPorOfertaUID } from "../../../repositorio/ofertas/obtenerOfertaPorOfertaUID.mjs";
import { actualizarOferta as actualizarOferta_ } from "../../../repositorio/ofertas/actualizarOferta.mjs";
import { eliminarApartamentosDeLaOferta } from "../../../repositorio/ofertas/eliminarApartamentosDeLaOferta.mjs";
import { insertarApartamentosEnOferta } from "../../../repositorio/ofertas/insertarApartamentosEnOferta.mjs";
import { validadoresLocales } from "../../../sistema/ofertas/validadoresLocales.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const actualizarOferta = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire()

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
        const ofertaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.ofertaUID,
            nombreCampo: "El identificador universal de la oferta (ofertaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
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
        const numero = entrada.body.numero;
        const simboloNumero = entrada.body.simboloNumero;
        const contextoAplicacion = entrada.body.contextoAplicacion;
        const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados;

        await validadoresCompartidos.fechas.fechaFin_ISO(fechaInicio_ISO)
        await validadoresCompartidos.fechas.fechaFin_ISO(fechaFin_ISO)
        validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada_ISO: fechaInicio_ISO,
            fechaSalida_ISO: fechaFin_ISO
        })

        if (tipoOferta !== "porNumeroDeApartamentos" &&
            tipoOferta !== "porApartamentosEspecificos" &&
            tipoOferta !== "porDiasDeAntelacion" &&
            tipoOferta !== "porRangoDeFechas" &&
            tipoOferta !== "porDiasDeReserva") {
            const error = "No se reconoce el tipo de oferta";
            throw new Error(error);
        }
        // Validar existencia de la oferta y estado
        const oferta = await obtenerOferatPorOfertaUID(ofertaUID)

        const estadoOferta = oferta.estadoOferta;
        if (estadoOferta === "activada") {
            const error = "No se puede modificar una oferta activa. Primero desactiva con el boton de estado.";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        if (tipoOferta === "porNumeroDeApartamentos" ||
            tipoOferta === "porDiasDeAntelacion" ||
            tipoOferta === "porDiasDeReserva") {
            validadoresLocales.tipoDescuento(tipoDescuento);
            validadoresLocales.numero(numero);
            validadoresLocales.simboloNumero(simboloNumero);
            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            await eliminarApartamentosDeLaOferta(ofertaUID)
            const metadatos = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                numero: numero,
                simboloNumero: simboloNumero,
                // contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento,
                ofertaUID: ofertaUID,
            };
            await actualizarOferta_(metadatos);

            const ok = {
                ok: "Se ha acualizado correctamente la oferta",
                detallesOferta: await obtenerOfertaConApartamentos(ofertaUID)
            };
            return ok
        }
        if (tipoOferta === "porRangoDeFechas") {
            validadoresLocales.tipoDescuento(tipoDescuento);
            validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            await eliminarApartamentosDeLaOferta(ofertaUID)
            const metadatos = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                numero: numero,
                simboloNumero: simboloNumero,
                // contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento,
                ofertaUID: ofertaUID,
            };
            await actualizarOferta_(metadatos);
            const ok = {
                ok: "Se ha acualizado correctamente la oferta",
                detallesOferta: await obtenerDetallesOferta(ofertaUID)
            };
            return ok
        }
        if (tipoOferta === "porApartamentosEspecificos") {
            validadoresLocales.contextoAplicacion(contextoAplicacion);
            if (contextoAplicacion === "totalNetoReserva") {
                validadoresLocales.tipoDescuento(tipoDescuento);
                validadoresLocales.controlLimitePorcentaje(tipoDescuento, cantidad);
            }
            if (contextoAplicacion === "totalNetoApartamentoDedicado") {
            }
            await eliminarApartamentosDeLaOferta(ofertaUID)
            const metadatos = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento,
                ofertaUID: ofertaUID,
            };
            await actualizarOferta_(metadatos);

            const apartamentosPorValidar = {
                apartamentos: apartamentosSeleccionados,
                contextoAplicacion: contextoAplicacion
            }
            await validarApartamentos(apartamentosPorValidar)
            const nuevosApartametnos = {
                ofertaUID: ofertaUID,
                apartamentos: apartamentosSeleccionados,
                contextoAplicacion: contextoAplicacion
            }
            await insertarApartamentosEnOferta(nuevosApartametnos)
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "La oferta  se ha actualizado bien junto con los apartamentos dedicados",
                detallesOferta: await obtenerDetallesOferta(ofertaUID)
            };
            return ok
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}