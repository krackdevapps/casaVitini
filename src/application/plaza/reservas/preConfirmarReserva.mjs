import { interruptor } from "../../../shared/configuracion/interruptores/interruptor.mjs";
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { insertarReserva } from "../../../shared/reservas/insertarReserva.mjs";
import { detallesReserva } from "../../../shared/reservas/detallesReserva.mjs";
import { actualizarEstadoPago } from "../../../shared/contenedorFinanciero/entidades/reserva/actualizarEstadoPago.mjs";
import { mensajesUI } from "../../../shared/mensajesUI.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { utilidades } from "../../../shared/utilidades.mjs";
import { validarHoraLimitePublica } from "../../../shared/reservas/validarHoraLimitePublica.mjs";
import { disponibilidadApartamentos } from "../../../shared/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs";
import { validarObjetoReservaPublica } from "../../../shared/reservas/nuevaReserva/reservaPulica/validarObjetoReservaPublica.mjs";
import { limitesReservaPublica } from "../../../shared/reservas/limitesReservaPublica.mjs";
import { validarServiciosPubicos } from "../../../shared/servicios/validarServiciosPublicos.mjs";
import { validarDescuentosPorCodigo } from "../../../shared/reservas/nuevaReserva/reservaPulica/validarDescuentosPorCodigo.mjs";
import { limpiarContenedorFinacieroInformacionPrivada } from "../../../shared/miCasa/misReservas/limpiarContenedorFinancieroInformacionPrivada.mjs";
import { enviarMailReservaConfirmadaAlCliente } from "../../../shared/mail/enviarMailReservaConfirmadaAlCliente.mjs";
import { enviarMailDeAvisoPorReservaPublica } from "../../../shared/mail/enviarMailDeAvisoPorReservaPublica.mjs";
import { validarComplementosAlojamiento } from "../../../shared/reservas/nuevaReserva/reservaPulica/validarComplementosAlojamiento.mjs";
import { semaforoCompartidoReserva } from "../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";
import { esquemaGlobal } from "../../administracion/reservas/detallesReserva/pdf/contenedores/esquemaGlobal.mjs";

export const preConfirmarReserva = async (entrada) => {
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesUI.aceptarReservasPublicas);
        }
        await utilidades.ralentizador(2000)
        await semaforoCompartidoReserva.acquire();

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

        await validarHoraLimitePublica({
            fechaEntrada
        })

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

        await validarComplementosAlojamiento(reservaPublica)
        const contenedorErrorInfoObsoleta = []
        if (servicios.serviciosNoReconocidos.length > 0) {
            const serviciosNoReconocidos = servicios.serviciosNoReconocidos
            const e = {
                error: "Lo siguientes servicios han dejado de estar disponibles",
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
                error: "Las siguientes ofertas seleccionadas por sus códigos de descuentos han dejado de estar disponibles",
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
                "desgloseFinanciero",
                "servicios",
                "complementosDeAlojamiento"
            ]
        })
        limpiarContenedorFinacieroInformacionPrivada(resolverDetallesReserva)
        const pdf = await esquemaGlobal({
            incluirTitular: "si",
            reserva: resolverDetallesReserva,
            tablasIDV: [
                "fechas",
                "alojamiento",
                "servicios",
                "totalesGlobales"
            ],
            configuracionPorTabla: {}
        });
        if (!testingVI) {
            //  enviarMailReservaConfirmadaAlCliente(reservaUID)
            // enviarMailDeAvisoPorReservaPublica(reservaUID)
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
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release();
        }
    }
}