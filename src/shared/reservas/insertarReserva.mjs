import { DateTime } from 'luxon';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
import { insertarReservaAdministrativa } from '../../infraestructure/repository/reservas/reserva/insertarReservaAdministrativa.mjs';
import { insertarTitularPool } from '../../infraestructure/repository/pool/insertarTitularPool.mjs';
import { insertarApartamentoEnReserva } from '../../infraestructure/repository/reservas/apartamentos/insertarApartamentoEnReserva.mjs';
import { insertarCamaEnLaHabitacion } from '../../infraestructure/repository/reservas/apartamentos/insertarCamaEnLaHabitacion.mjs';
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from '../../infraestructure/repository/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs';
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from '../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs';
import { insertarHabitacionEnApartamento } from '../../infraestructure/repository/reservas/apartamentos/insertarHabitacionEnApartamento.mjs';
import { procesador } from '../contenedorFinanciero/procesador.mjs';
import { insertarDesgloseFinacieroPorReservaUID } from '../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/insertarDesgloseFinacieroPorReservaUID.mjs';
import { obtenerCamaComoEntidadPorCamaIDVPorTipoIDV } from '../../infraestructure/repository/arquitectura/entidades/cama/obtenerCamaComoEntidadPorCamaIDVPorTipoIDV.mjs';
import { generadorReservaUID } from '../../shared/reservas/utilidades/generadorReservaUID.mjs';
import { obtenerServicioPorServicioUID } from '../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs';
import { insertarServicioPorReservaUID } from '../../infraestructure/repository/reservas/servicios/insertarServicioPorReservaUID.mjs';

export const insertarReserva = async (reserva) => {
    try {
        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reserva.fechaEntrada,
            nombreCampo: "La fecha de entrada de la reserva a confirmar"
        }))
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: reserva.fechaSalida,
            nombreCampo: "La fecha de entrada de la reserva a confirmar"
        }))
        const estadoReserva = "pendiente"
        const estadoPago = "noPagado"
        const origen = "cliente"
        const fechaCreacion = DateTime.utc().toISO()
        const fechaCreacion_simple = DateTime.utc().toISODate();
        const alojamiento = reserva.alojamiento
        const titular = reserva.titular
        const testingVI = reserva.testingVI
        const titularReservaPool = titular.nombreTitular
        const pasaporteTitularPool = titular.pasaporteTitular
        const correoTitular = titular.correoTitular
        const telefonoTitular = titular.telefonoTitular
        const codigoInternacional = titular.codigoInternacional
        const codigosDescuento = reserva.codigosDescuento || []
        const contendorServicios = reserva?.servicios || []

        const reservaUID = await generadorReservaUID()
        const nuevaReserva = await insertarReservaAdministrativa({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            estadoReserva: estadoReserva,
            origen: origen,
            fechaCreacion,
            estadoPago: estadoPago,
            reservaUID: reservaUID,
            testingVI: testingVI
        })
        await insertarTitularPool({
            titularReservaPool: titularReservaPool,
            pasaporteTitularPool: pasaporteTitularPool,
            correoTitular: correoTitular,
            telefonoTitular: codigoInternacional + telefonoTitular,
            reservaUID: reservaUID
        })
        for (const apartamentoConfiguracion in alojamiento) {
            const apartamentoIDV = apartamentoConfiguracion
            const habitaciones = alojamiento[apartamentoConfiguracion].habitaciones

            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
            const apartamentoUI = apartamento.apartamentoUI

            const nuevoApartamentoEnReserva = await insertarApartamentoEnReserva({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            })
            const apartamentoUID = nuevoApartamentoEnReserva.componenteUID

            for (const habitacionConfiguracion in habitaciones) {
                const habitacionIDV = habitacionConfiguracion
                const camaIDV = habitaciones[habitacionIDV].camaSeleccionada.camaIDV
                const pernoctantesPool = habitaciones[habitacionIDV].pernoctantes
                const habitacion = await obtenerHabitacionComoEntidadPorHabitacionIDV({
                    habitacionIDV,
                    errorSi: "noExiste"
                })
                const habitacionUI = habitacion.habitacionUI

                const nuevoHabitacionEnElApartamento = await insertarHabitacionEnApartamento({
                    apartamentoUID: apartamentoUID,
                    habitacionIDV: habitacionIDV,
                    reservaUID: reservaUID,
                    habitacionUI: habitacionUI
                })
                const habitacionUID = nuevoHabitacionEnElApartamento.componenteUID
                const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                    camaIDV,
                    tipoIDVArray: ["compartida"],
                    errorSi: "noExiste"
                })
                const camaUI = cama.camaUI

                await insertarCamaEnLaHabitacion({
                    habitacionUID: habitacionUID,
                    nuevaCamaIDV: camaIDV,
                    reservaUID: reservaUID,
                    camaUI: camaUI
                })
            }
        }
        const apartamentosArray = Object.keys(alojamiento);
        const serviciosUID = contendorServicios.map((contenedor) => {
            return contenedor.servicioUID
        })
        const soloCodigosBase64Descunetos = []
        codigosDescuento.forEach((contenedor) => {
            const codigosUID = contenedor.codigosUID
            codigosUID.forEach((codigo) => {
                soloCodigosBase64Descunetos.push(codigo)
            })

        })




        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    fechaActual: fechaCreacion_simple,
                    apartamentosArray: apartamentosArray,
                    origenSobreControl: "reserva"
                },
                servicios: {
                    origen: "hubServicios",
                    serviciosUIDSolicitados: serviciosUID
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
        await insertarDesgloseFinacieroPorReservaUID({
            reservaUID,
            desgloseFinanciero
        })
        for (const servicioUID of serviciosUID) {
            const servicio = await obtenerServicioPorServicioUID(servicioUID)
            const nombreServicico = servicio.nombre
            const contenedorServicio = servicio.contenedor
            contenedorServicio.servicioUID = servicioUID
            await insertarServicioPorReservaUID({
                reservaUID,
                nombre: nombreServicico,
                contenedor: contenedorServicio
            })
        }

        return nuevaReserva
    } catch (errorCapturado) {
        throw errorCapturado
    }
}