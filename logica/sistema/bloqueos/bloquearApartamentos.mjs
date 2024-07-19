import { obtenerConfiguracionPorApartamentoIDV } from '../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs';
import { insertarNuevoBloqueo } from '../../repositorio/bloqueos/insertarNuevoBloqueo.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoUID.mjs';
import { obtenerReservaPorReservaUID } from '../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
export const bloquearApartamentos = async (metadatos) => {
    try {
        const reservaUID = metadatos.reservaUID
        const apartamentoUID = metadatos.apartamentoUID

        const tipoBloqueo = metadatos.tipoBloqueo
        const fechaEntrada = metadatos.fechaEntrada
        const fechaSalida = metadatos.fechaSalida
        const zonaIDV = metadatos.zonaIDV
        const origen = metadatos.origen

        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada,
            nombreCampo: "La fecha de entrada"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida,
            nombreCampo: "La fecha de salida"
        })

        if (tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "permanente" && tipoBloqueo !== "sinBloqueo") {
            const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo"
            throw new Error(error)
        }
        if (zonaIDV !== "publico" && zonaIDV !== "privado" && zonaIDV !== "global") {
            const error = "El campo 'zonaIDV' solo puede ser publico, privado, global"
            throw new Error(error)
        }
        if (origen !== "cancelacionDeReserva" && origen !== "eliminacionApartamentoDeReserva") {
            const error = "El campo 'origen' solo puede ser cancelacionDeReserva o eliminacionApartamentoDeReserva"
            throw new Error(error)
        }

        await obtenerReservaPorReservaUID(reservaUID)
        const apartamentoDeLaReserva = await obtenerApartamentoDeLaReservaPorApartamentoUID({
            reservaUID,
            apartamentoUID
        })

        const apartamentoIDV = apartamentoDeLaReserva.apartamentoIDV

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })


        const motivoDelBloqueo = (origen) => {

            if (origen === "cancelacionDeReserva") {
                return `Bloqueo producido por la cancelación de la reserva ${reservaUID}`
            }
            if (origen === "eliminacionApartamentoDeReserva") {
                return `Bloqueo producido por eliminar este apartamento de la reserva ${reservaUID}`
            }
        }

        if (tipoBloqueo === "rangoTemporal") {
            await insertarNuevoBloqueo({
                apartamentoIDV: apartamentoIDV,
                tipoBloqueo: tipoBloqueo,
                fechaInicio: fechaEntrada,
                fechaFin: fechaSalida,
                motivo: motivoDelBloqueo(origen),
                zonaIDV: zonaIDV
            })
        }
        if (tipoBloqueo === "permanente") {
            await insertarNuevoBloqueo({
                apartamentoIDV: apartamentoIDV,
                tipoBloqueo: tipoBloqueo,
                motivo: motivoDelBloqueo(origen),
                zonaIDV: zonaIDV
            })
        }
        const ok = {}
        if (tipoBloqueo === "rangoTemporal") {
            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo temporal"
        }
        if (tipoBloqueo === "permanente") {
            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo permanente"
        }
        if (tipoBloqueo === "sinBloqueo") {
            ok.ok = "Se ha eliminado el apartamento de la reserva y se ha liberado"
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado;
    }
}
