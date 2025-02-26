import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarDesgloseFinacieroPorReservaUID } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/actualizarDesgloseFinacieroPorReservaUID.mjs"
import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../../infraestructure/repository/reservas/transacciones/desgloseFinanciero/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { eliminarSobreControlApartamento } from "../../../../../infraestructure/repository/reservas/transacciones/sobreControl/eliminarSobreControlApartamento.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { procesador } from "../../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"
import _ from 'lodash';

export const eliminarSobreControlNoche = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo de apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const fechaNoche = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaNoche,
            nombreCampo: "El campo fechaNoche"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, no se pueden alterar los descuentos."
            throw new Error(error)
        }
        const instantaneaNetoApartamento = await obtenerDetalleNochePorFechaNochePorApartamentoIDV({
            reservaUID,
            apartamentoIDV,
            fechaNoche
        })
        const sobreControlActualizado = await eliminarSobreControlApartamento({
            reservaUID,
            apartamentoIDV,
            fechaNoche
        })
        const desgloseFinanciero = await actualizadorIntegradoDesdeInstantaneas(reservaUID)

        const ok = {
            ok: {
                ...desgloseFinanciero,
                instantaneaNetoApartamento,
                ...sobreControlActualizado
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}