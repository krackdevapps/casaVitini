import { DateTime } from "luxon"
import { procesador } from "../../shared/contenedorFinanciero/procesador.mjs"
import { limitesReservaPublica } from "../../shared/reservas/limitesReservaPublica.mjs"
import { disponibilidadApartamentos } from "../../shared/reservas/nuevaReserva/reservaPulica/disponibilidadApartamentos.mjs"
import { validarDescuentosPorCodigo } from "../../shared/reservas/nuevaReserva/reservaPulica/validarDescuentosPorCodigo.mjs"
import { validarObjetoReservaPublica } from "../../shared/reservas/nuevaReserva/reservaPulica/validarObjetoReservaPublica.mjs"
import { validarServiciosPubicos } from "../../shared/servicios/validarServiciosPublicos.mjs"
import { limpiarContenedorFinacieroInformacionPrivada } from "../../shared/miCasa/misReservas/limpiarContenedorFinancieroInformacionPrivada.mjs"

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
            codigosDescuentosSiReconocidos.push(...controlCodigosDescuentos.codigosDescuentosSiReconocidos)

            const cSiReconocidos = controlCodigosDescuentos.codigosDescuentosSiReconocidos
            cSiReconocidos.forEach((contenedor) => {
                const codigosUID = contenedor.codigosUID
                codigosUID.forEach((codigo, i) => {
                    const buffer = Buffer.from(codigo, 'base64');
                    codigo = buffer.toString('utf-8');
                    codigosUID[i] = buffer.toString('utf-8');
                })
            })
            const cNoReconocidos = controlCodigosDescuentos.codigosDescuentosNoReconocidos
            cNoReconocidos.forEach((contenedor) => {
                const codigosUID = contenedor.codigosUID
                codigosUID.forEach((codigo, i) => {
                    const buffer = Buffer.from(codigo, 'base64');
                    codigo = buffer.toString('utf-8');
                    codigosUID[i] = buffer.toString('utf-8');
                })
            })

            ok.control.codigosDescuentos = controlCodigosDescuentos

        }

        const soloCodigosBase64Descunetos = []
        codigosDescuentosSiReconocidos.forEach((contenedor) => {
            const grupoCodigos = contenedor.codigosUID
            grupoCodigos.forEach((codigoUTF8) => {
                const bufferFromUTF = Buffer.from(codigoUTF8, "utf8")
                const codigoB64 = bufferFromUTF.toString("base64")
                soloCodigosBase64Descunetos.push(codigoB64)
            })
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