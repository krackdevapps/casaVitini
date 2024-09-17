import { Mutex } from "async-mutex";
import { interruptor } from "../../../sistema/configuracion/interruptor.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { insertarReserva } from "../../../sistema/reservas/insertarReserva.mjs";
import { detallesReserva } from "../../../sistema/reservas/detallesReserva.mjs";
import { enviarMailReservaConfirmada } from "../../../sistema/mail/enviarMailReservaConfirmada.mjs";
import { actualizarEstadoPago } from "../../../sistema/contenedorFinanciero/entidades/reserva/actualizarEstadoPago.mjs";
import { mensajesUI } from "../../../componentes/mensajesUI.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { generadorPDF } from "../../../sistema/pdf/generadorPDF.mjs";
import { utilidades } from "../../../componentes/utilidades.mjs";
import { validarHoraLimitePublica } from "../../../sistema/reservas/validarHoraLimitePublica.mjs";
import { disponibilidadApartamentos } from "../../../sistema/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs";
import { validarObjetoReservaPublica } from "../../../sistema/reservas/nuevaReserva/reservaPulica/validarObjetoReservaPublica.mjs";
import { limitesReservaPublica } from "../../../sistema/reservas/limitesReservaPublica.mjs";
import { validarServiciosPubicos } from "../../../sistema/servicios/validarServiciosPublicos.mjs";
import { validarDescuentosPorCodigo } from "../../../sistema/reservas/nuevaReserva/reservaPulica/validarDescuentosPorCodigo.mjs";

export const preConfirmarReserva = async (entrada) => {
    const mutex = new Mutex()
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        await utilidades.ralentizador(2000)
        await mutex.acquire()

        const reservaPublica = entrada.body.reserva;



        await validarObjetoReservaPublica({
            reservaPublica,
            filtroTitular: "activado",
            filtroHabitacionesCamas: "activado"
        })
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            reservaPublica.testingVI = testingVI
        }

        await campoDeTransaccion("iniciar")

        const fechaEntrada = reservaPublica.fechaEntrada
        const fechaSalida = reservaPublica.fechaSalida
        const apartamentosIDVArray = Object.keys(reservaPublica.alojamiento)
        const codigosDescuento = reservaPublica.codigosDescuento
        const serviciosPorValidar = reservaPublica?.servicios



        await validarHoraLimitePublica()

        await limitesReservaPublica({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida
        })
        await eliminarBloqueoCaducado()
        await disponibilidadApartamentos({
            fechaEntrada,
            fechaSalida,
            apartamentosIDVArray
        })

        const servicios = await validarServiciosPubicos(serviciosPorValidar)

        const contenedorErrorInfoObsoleta = []
        if (servicios.serviciosNoReconocidos.length > 0) {
            const serviciosNoReconocidos = servicios.serviciosNoReconocidos
            const e = {
                error: "Lo siguientes servicios han dejado de estar disponbiles",
                tipo: "servicios",
                lista: serviciosNoReconocidos
            }
            contenedorErrorInfoObsoleta.push(e)
        }

        const codigosDescuentosValidados = await validarDescuentosPorCodigo({
            zonasArray: ["global", "publica"],
            contenedorCodigosDescuento: codigosDescuento,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosArray: apartamentosIDVArray
        })

        if (codigosDescuentosValidados.codigosDescuentosNoReconocidos.length > 0) {
            const codigosNoReconocidos = codigosDescuentosValidados.codigosDescuentosNoReconocidos
            const e = {
                error: "Lo siguientes codigos han dejado de estar disponbiles",
                tipo: "codigosDescuento",
                lista: codigosNoReconocidos
            }
            contenedorErrorInfoObsoleta.push(e)
        }
        if (contenedorErrorInfoObsoleta.length > 0) {
            const error = {
                error: "Se han detectado componentes obsoletos",
                contenedorErrorInfoObsoleta
            }
            throw error
        }
        const ok1 = {
            ok: "bien"
        }

        const resolvertInsertarReserva = await insertarReserva(reservaPublica)
        const reservaUID = resolvertInsertarReserva.reservaUID

        await actualizarEstadoPago(reservaUID)
        await campoDeTransaccion("confirmar")

        const resolverDetallesReserva = await detallesReserva({
            reservaUID: reservaUID,
            capas: [
                "titular",
                "alojamiento",
                "pernoctantes",
                "desgloseFinanciero"
            ]
        })
        const pdf = await generadorPDF(resolverDetallesReserva);
        if (!testingVI) {
            //   enviarMailReservaConfirmada(reservaUID);
        }
        const ok = {
            ok: "Reserva confirmada",
            detalles: resolverDetallesReserva,
            pdf
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}