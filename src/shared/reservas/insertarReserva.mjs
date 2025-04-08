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
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from '../../infraestructure/repository/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs';
import { obtenerComplementoPorComplementoUID } from '../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs';
import { insertarComplementoAlojamientoPorReservaUID } from '../../infraestructure/repository/reservas/complementosAlojamiento/insertarComplementoAlojamientoPorReservaUID.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from '../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs';
import { obtenerConfiguracionPorApartamentoIDV } from '../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from '../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs';
import { codigoZonaHoraria } from '../configuracion/codigoZonaHoraria.mjs';
import { obtenerHabitacionDelApartamentoPorHabitacionUID } from '../../infraestructure/repository/arquitectura/configuraciones/obtenerHabitacionDelApartamentoPorHabitacionUID.mjs';
import { obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV } from '../../infraestructure/repository/reservas/apartamentos/obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV.mjs';
import { obtenerApartamentosDeLaReservaPorReservaUID } from '../../infraestructure/repository/reservas/apartamentos/obtenerApartamentosDeLaReservaPorReservaUID.mjs';
import { estadoInicialPagoServicio } from './servicios/estadoInicialPagoServicio.mjs';
import { sincronizarRegistros } from './detallesReserva/servicios/sincronizarRegistros.mjs';

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
        const fechaCreacionUTC = DateTime.utc().toISO()
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaCreacion_simple_TZ = DateTime.now().setZone(zonaHoraria).toISODate();
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
        const complementosAlojamiento = reserva?.complementosAlojamiento || []


        const reservaUID = await generadorReservaUID()
        const nuevaReserva = await insertarReservaAdministrativa({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            estadoReserva: estadoReserva,
            origen: origen,
            fechaCreacion: fechaCreacionUTC,
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

        for (const [apartamentoIDV, contenedor_alojamiento] of Object.entries(alojamiento)) {

            await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })


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

            const habitacionesConfiguracionAlojamiento = await obtenerHabitacionesDelApartamentoPorApartamentoIDV(apartamentoIDV)
            for (const habitacionConfiguracion of habitacionesConfiguracionAlojamiento) {
                const habitacionIDV = habitacionConfiguracion.habitacionIDV
                const habitacionUID = habitacionConfiguracion.componenteUID

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

                const habitacionUID_enReserva = nuevoHabitacionEnElApartamento.componenteUID

                const camasSeleccionablesHabitacion = await obtenerCamasDeLaHabitacionPorHabitacionUID(habitacionUID)
                let camaIDV
                if (camasSeleccionablesHabitacion.length === 1) {
                    const cama = camasSeleccionablesHabitacion[0]
                    camaIDV = cama.camaIDV

                } else if (camasSeleccionablesHabitacion.length > 1) {
                    camaIDV = contenedor_alojamiento.habitaciones[habitacionIDV].camaSeleccionada.camaIDV
                }

                const cama = await obtenerCamaComoEntidadPorCamaIDVPorTipoIDV({
                    camaIDV,
                    tipoIDVArray: ["compartida"],
                    errorSi: "noExiste"
                })
                const camaUI = cama.camaUI

                await insertarCamaEnLaHabitacion({
                    reservaUID: reservaUID,
                    habitacionUID: habitacionUID_enReserva,
                    nuevaCamaIDV: camaIDV,
                    camaUI: camaUI
                })
            }
        }
        const apartamentosArray = Object.keys(alojamiento);
        const soloCodigosBase64Descunetos = []
        codigosDescuento.forEach((contenedor) => {
            const codigosUID = contenedor.codigosUID
            codigosUID.forEach((codigo) => {
                soloCodigosBase64Descunetos.push(codigo)
            })

        })

        const complementosUIDSolicitados = complementosAlojamiento.map(contenedor => contenedor.complementoUID)
        for (const com of complementosAlojamiento) {
            const complementoUID = com.complementoUID
            const complemento = await obtenerComplementoPorComplementoUID(complementoUID)

            const complementoUI = complemento.complementoUI
            const apartamentoIDV = complemento.apartamentoIDV
            const definicion = complemento.definicion
            const tipoPrecio = complemento.tipoPrecio
            const precio = complemento.precio
            const tipoUbicacion = complemento.tipoUbicacion
            const habitacionUID = complemento.habitacionUID

            const apartamentoEnReserva = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
                reservaUID,
                apartamentoIDV
            })
            let habitacionUID_enReserva

            if (tipoUbicacion === "habitacion") {
                const apartamentosReserva = await obtenerApartamentosDeLaReservaPorReservaUID(reservaUID)
                const controlApartamento = apartamentosReserva.filter(a => a.apartamentoIDV === apartamentoIDV)
                const apartamentoUID = controlApartamento[0].componenteUID


                const habitacionDeLaConfiguracion = await obtenerHabitacionDelApartamentoPorHabitacionUID(habitacionUID)
                const habitacionIDV = habitacionDeLaConfiguracion.habitacionIDV

                const habitacionDelApartamento = await obtenerHabitacionDelApartamentoPorApartamentoUIDPorHabitacionIDV({
                    apartamentoUID,
                    habitacionIDV,
                    errorSi: "desactivado"
                })

                habitacionUID_enReserva = habitacionDelApartamento.componenteUID
            }

            await insertarComplementoAlojamientoPorReservaUID({
                reservaUID,
                complementoUI,
                apartamentoIDV,
                definicion,
                tipoPrecio,
                precio,
                apartamentoUID: apartamentoEnReserva.componenteUID,
                tipoUbicacion,
                habitacionUID: habitacionUID_enReserva
            })
        }


        for (const servicioSolicitado of contendorServicios) {
            const servicioUID = servicioSolicitado.servicioUID
            const opcionesSel = servicioSolicitado.opcionesSeleccionadas
            const servicio = await obtenerServicioPorServicioUID(servicioUID)
            const nombreServicico = servicio.nombre
            const contenedorServicio = servicio.contenedor
            contenedorServicio.servicioUID = servicioUID
            const gruposDeOpciones = contenedorServicio.gruposDeOpciones
            const descuentoTotalServicio = servicioSolicitado.descuentoTotalServicio

            const eIP = estadoInicialPagoServicio({
                gruposDeOpciones
            })
            await sincronizarRegistros({
                opcionesSeleccionadasDelServicio: servicioSolicitado,
                servicioExistenteAccesible: servicio,
            })

            await insertarServicioPorReservaUID({
                reservaUID,
                nombre: nombreServicico,
                contenedor: contenedorServicio,
                opcionesSel: opcionesSel,
                descuentoTotalServicio: {
                    tipoDescuento: "sinDescuento",
                    cantidadDescuento: "0.00"
                },
                estadoPagoIDV: eIP
            })

       
    
          //  throw new Error("reserva<1")
        }

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    fechaActual: fechaCreacion_simple_TZ,
                    apartamentosArray: apartamentosArray,
                    origenSobreControl: "reserva"
                },
                complementosAlojamiento: {
                    origen: "instantaneaComplementosAlojamientoEnReserva",
                    reservaUID: reservaUID
                },
                servicios: {
                    origen: "instantaneaServiciosEnReserva",
                    reservaUID: reservaUID
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

        return nuevaReserva
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
