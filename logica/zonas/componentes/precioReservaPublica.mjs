import { procesador } from "../../sistema/contenedorFinanciero/procesador.mjs"
import { limitesReservaPublica } from "../../sistema/reservas/limitesReservaPublica.mjs"
import { disponibilidadApartamentos } from "../../sistema/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs"
import { validarDescuentosPorCodigo } from "../../sistema/reservas/nuevaReserva/reservaPulica/validarDescuentosPorCodigo.mjs"
import { validarObjetoReservaPublica } from "../../sistema/reservas/nuevaReserva/reservaPulica/validarObjetoReservaPublica.mjs"
import { validarServiciosPubicos } from "../../sistema/servicios/validarServiciosPublicos.mjs"

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
        const serviciosUIDSolicitados = reservaPublica?.servicios || []

        const ok = {
            ok: "Precio actualizado en base a componentes solicitados"
        }

        const constructorInformacionObsoleta = (data) => {
            if (!data.hasOwnProperty("control")) {
                data.control = {}
            }
        }

        const serviciosSiReconocidos = []
        if (serviciosUIDSolicitados.length > 0) {
            const controlServicios = await validarServiciosPubicos(serviciosUIDSolicitados)
            constructorInformacionObsoleta(ok)
            ok.control.servicios = controlServicios
            controlServicios.serviciosSiReconocidos.forEach((contenedor) => {
                serviciosSiReconocidos.push(contenedor.servicioUID)
            })
        }

        const codigosDescuentosSiReconocidos = []
        if (contenedorCodigosDescuento.length > 0) {
            const controlCodigosDescuentos = await validarDescuentosPorCodigo({
                zonasArray: ["global", "publica"],
                contenedorCodigosDescuento: contenedorCodigosDescuento,
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                apartamentosArray: apartamentosIDV
            })
            constructorInformacionObsoleta(ok)
            ok.control.codigosDescuentos = controlCodigosDescuentos
            codigosDescuentosSiReconocidos.push(...controlCodigosDescuentos.codigosDescuentosSiReconocidos)
        }
        
        const soloCodigosBase64Descunetos = codigosDescuentosSiReconocidos.map((contenedor) => {
            return contenedor.codigoUID
        })

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntradaReserva,
                    fechaSalida: fechaSalidaReserva,
                    apartamentosArray: apartamentosIDV,
                    origenSobreControl: "reserva"
                },
                servicios: {
                    origen: "hubServicios",
                    serviciosUIDSolicitados: serviciosSiReconocidos
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

        ok.desgloseFinanciero = desgloseFinanciero
        return ok
    } catch (error) {
        throw error
    }
}