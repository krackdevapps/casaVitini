import { Mutex } from "async-mutex"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { validarObjetoOferta } from "../../../../shared/ofertas/entidades/reserva/validarObjetoOferta.mjs"
import { obtenerOfertasPorNombreUI } from "../../../../infraestructure/repository/ofertas/obtenerOfertasPorNombreUI.mjs"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { DateTime } from "luxon"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { soloFiltroDataGlobal } from "../../../../shared/simuladorDePrecios/soloFiltroDataGlobal.mjs"
import { utilidades } from "../../../../shared/utilidades.mjs"
import { insertarDescuentoPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/descuentos/insertarDescuentoPorSimulacionUID.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"

export const insertarDescuentoDedicado = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 7
        })
        await mutex.acquire();

        const data = entrada.body

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: data.simulacionUID,
            nombreCampo: "El identificador universal de la reserva (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const llavesGlobalesFaltantes = await soloFiltroDataGlobal(simulacionUID)
        if (llavesGlobalesFaltantes.length > 0) {
            const llavesSring = utilidades.constructorComasEY({
                array: llavesGlobalesFaltantes,
                articulo: ""
            })
            const m = `No se puede insertar un descuento administrativo en la simulacion, por que faltan los siguientes datos globales de la simulacion: ${llavesSring}`
            throw new Error(m)
        }
        const zonaIDV = simulacion.zonaIDV
        const descuentoDedicadoRaw = data.descuentoDedicado

        const tiempoZH = DateTime.now();
        const fechaActual = tiempoZH.toFormat("yyyyMMddHHmmssSSS")

        const descuentoDedicado = {
            nombreOferta: descuentoDedicadoRaw?.nombreOferta,
            zonaIDV: "global",
            entidadIDV: "reserva",
            fechaInicio: simulacion.fechaEntrada,
            fechaFinal: simulacion.fechaSalida,
            condicionesArray: [],
            descuentosJSON: descuentoDedicadoRaw?.descuentosJSON
        }
        await validarObjetoOferta({
            oferta: descuentoDedicado,
            modo: "crearOferta",
            filtroCondiciones: "desactivado"
        })
        descuentoDedicado.ofertaUID = fechaActual
        const nombreOferta = descuentoDedicado.nombreOferta

        await campoDeTransaccion("iniciar")
        const ofertasPorNombre = await obtenerOfertasPorNombreUI(nombreOferta)
        if (ofertasPorNombre.length > 0) {
            const error = "Ya existe un nombre de oferta exactamente igual a este, por favor elige otro nombre para esta oferta con el fin de evitar confusiones";
            throw new Error(error);
        }

        const nuevaOferta = await insertarDescuentoPorSimulacionUID({
            simulacionUID,
            descuentoDedicado: {
                oferta: descuentoDedicado
            }
        })
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el descuento dedicado en la simulacion",
            simulacionUID,
            oferta: nuevaOferta,
            ...postProcesadoSimualacion
        }
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}