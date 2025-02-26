import { DateTime } from "luxon"
import { procesador } from "../../shared/contenedorFinanciero/procesador.mjs"
import { limitesReservaPublica } from "../../shared/reservas/limitesReservaPublica.mjs"
import { disponibilidadApartamentos } from "../../shared/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs"
import { validarDescuentosPorCodigo } from "../../shared/reservas/nuevaReserva/reservaPulica/validarDescuentosPorCodigo.mjs"
import { validarObjetoReservaPublica } from "../../shared/reservas/nuevaReserva/reservaPulica/validarObjetoReservaPublica.mjs"
import { validarServiciosPubicos } from "../../shared/servicios/validarServiciosPublicos.mjs"
import { limpiarContenedorFinacieroInformacionPrivada } from "../../shared/miCasa/misReservas/limpiarContenedorFinancieroInformacionPrivada.mjs"
import { validarComplementosAlojamiento } from "../../shared/reservas/nuevaReserva/reservaPulica/validarComplementosAlojamiento.mjs"
import { obtenerComplementoPorComplementoUIDArray } from "../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUIDArray.mjs"
import { validadorComplementosDeAlojamiento } from "../plaza/reservas/validadores/validadorComplementosDeAlojamiento.mjs"
import { validadorServicios } from "../plaza/reservas/validadores/validadorServicios.mjs"
import { validadorDescuentos } from "../plaza/reservas/validadores/validadosDescuentos.mjs"

export const precioReservaPublica = async (entrada) => {
    try {
        const reservaPublica = entrada.body?.reserva
        await validarObjetoReservaPublica({
            reservaPublica: reservaPublica,
            filtroTitular: "desactivado",
            filtroHabitacionesCamas: "desactivado",
        })

        const fechaEntrada = reservaPublica.fechaEntrada
        const fechaSalida = reservaPublica.fechaSalida
        const apartamentosIDVArray = Object.keys(reservaPublica.alojamiento)
        const fechaCreacion_simple = DateTime.utc().toISODate();

        await limitesReservaPublica({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida
        })

        await disponibilidadApartamentos({
            fechaEntrada,
            fechaSalida,
            apartamentosIDVArray
        })

        const fechaEntradaReserva = reservaPublica.fechaEntrada
        const fechaSalidaReserva = reservaPublica.fechaSalida
        const alojamiento = reservaPublica.alojamiento
        const apartamentosIDV = Object.keys(alojamiento)
        const contenedorCodigosDescuento = reservaPublica.codigosDescuento || []
        const servicios = reservaPublica?.servicios || []
        const complementosAlojamiento = reservaPublica?.complementosAlojamiento || []

        // await validarComplementosAlojamiento(reservaPublica)

        const ok = {
            ok: "Precio actualizado en base a componentes solicitados",
            control: {}
        }
        const complementosDeAlojamientoSiRecononcidos = []
        await validadorComplementosDeAlojamiento({
            complementosAlojamiento,
            schemaControl: ok.control,
            complementosDeAlojamientoSiRecononcidos
        })

        const serviciosSiReconocidos = []
        await validadorServicios({
            servicios,
            schemaControl: ok.control,
            serviciosSiReconocidos
        })

        const soloCodigosBase64Descunetos = []
        await validadorDescuentos({
            contenedorCodigosDescuento,
            schemaControl: ok.control,
            soloCodigosBase64Descunetos,
            fechaEntrada,
            fechaSalida,
            apartamentosIDV
        })

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntradaReserva,
                    fechaSalida: fechaSalidaReserva,
                    fechaActual: fechaCreacion_simple,
                    apartamentosArray: apartamentosIDV,
                    origenSobreControl: "reserva"
                },
                complementosAlojamiento: {
                    origen: "hubComplementosAlojamiento",
                    complementosUIDSolicitados: complementosDeAlojamientoSiRecononcidos
                },
                servicios: {
                    origen: "hubServicios",
                    serviciosSolicitados: serviciosSiReconocidos
                },
            },
            capas: {
                ofertas: {
                    zonasArray: ["global", "publica"],
                    operacion: {
                        tipo: "insertarDescuentosPorCondicionPorCodigo",
                    },
                    codigoDescuentosArrayBASE64: soloCodigosBase64Descunetos,
                    ignorarCodigosDescuentos: "no"

                },
                impuestos: {
                    origen: "hubImuestos"
                }
            }
        })
        limpiarContenedorFinacieroInformacionPrivada({
            contenedorFinanciero: {
                desgloseFinanciero
            }
        })

        ok.desgloseFinanciero = desgloseFinanciero
        return ok
    } catch (error) {
        throw error
    }
}