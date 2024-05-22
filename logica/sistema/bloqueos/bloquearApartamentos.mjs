import { obtenerConfiguracionPorApartamentoIDV } from '../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs';
import { insertarNuevoBloqueo } from '../../repositorio/bloqueos/insertarNuevoBloqueo.mjs';
import { obtenerApartamentoDeLaReservaPorApartamentoUID } from '../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoUID.mjs';
import { obtenerReservaPorReservaUID } from '../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';
export const bloquearApartamentos = async (metadatos) => {
    try {
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: metadatos.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const apartamentoUID = validadoresCompartidos.tipos.numero({
            number: metadatos.apartamentoUID,
            nombreCampo: "El apartamentoUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const tipoBloqueo = metadatos.tipoBloqueo
        const fechaEntrada_ISO = metadatos.fechaEntrada_ISO
        const fechaSalida_ISO = metadatos.fechaSalida_ISO
        const zonaBloqueo = metadatos.zonaBloqueo
        const origen = metadatos.origen

        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaEntrada_ISO,
            nombreCampo: "La fecha de entrada"
        })
        await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: fechaSalida_ISO,
            nombreCampo: "La fecha de salida"
        })

        if (tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "permanente" && tipoBloqueo !== "sinBloqueo") {
            const error = "El campo 'tipoBloqueo' solo puede ser rangoTemporal, permanente, sinBloqueo"
            throw new Error(error)
        }
        if (zonaBloqueo !== "publico" && zonaBloqueo !== "privado" && zonaBloqueo !== "global") {
            const error = "El campo 'zonaBloqueo' solo puede ser publico, privado, global"
            throw new Error(error)
        }
        if (origen !== "cancelacionDeReserva" && origen !== "eliminacionApartamentoDeReserva") {
            const error = "El campo 'origen' solo puede ser cancelacionDeReserva o eliminacionApartamentoDeReserva"
            throw new Error(error)
        }

        await obtenerReservaPorReservaUID(reservaUID)
        const apartamentoDeLaReserva = obtenerApartamentoDeLaReservaPorApartamentoUID({
            reservaUID: reservaUID,
            apartamentoUID: apartamentoUID
        })
        const apartamentoIDV = apartamentoDeLaReserva.apartamentoIDV
        await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)


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
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                motivoFinal: motivoDelBloqueo(origen),
                zonaBloqueo: zonaBloqueo
            })
        }
        if (tipoBloqueo === "permanente") {
            await insertarNuevoBloqueo({
                apartamentoIDV: apartamentoIDV,
                tipoBloqueo: tipoBloqueo,
                motivoFinal: motivoDelBloqueo(origen),
                zonaBloqueo: zonaBloqueo
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
