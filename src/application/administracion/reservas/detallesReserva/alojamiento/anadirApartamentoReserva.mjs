import { apartamentosPorRango } from "../../../../../shared/selectoresCompartidos/apartamentosPorRango.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { insertarApartamentoEnReserva } from "../../../../../infraestructure/repository/reservas/apartamentos/insertarApartamentoEnReserva.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from "../../../../../infraestructure/repository/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { semaforoCompartidoReserva } from "../../../../../shared/semaforosCompartidos/semaforoCompartidoReserva.mjs";

export const anadirApartamentoReserva = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        await semaforoCompartidoReserva.acquire();

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
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await eliminarBloqueoCaducado();

        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })


        const detallesReserva = await obtenerReservaPorReservaUID(reservaUID)
        if (detallesReserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        const fechaEntrada = detallesReserva.fechaEntrada;
        const fechaSalida = detallesReserva.fechaSalida;


        const apartamentoReserva = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
            reservaUID: reservaUID,
            apartamentoIDV: apartamentoIDV
        })
        if (apartamentoReserva?.apartamentoIDV) {
            const error = "El apartamento ya existe en la reserva";
            throw new Error(error);
        }
        const rol = entrada.session.rolIDV;

        const resuelveApartamentosDisponibles = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            zonaConfiguracionAlojamientoArray: ["privada", "global"],
            zonaBloqueo_array: ["privada", "global"],
        })
        const apartamentosDisponiblesResueltos = resuelveApartamentosDisponibles.apartamentosDisponibles;
        if (apartamentosDisponiblesResueltos.length === 0) {
            const error = "No hay ningún apartamento disponible para las fechas de la reserva";
            throw new Error(error);
        }
        if (apartamentosDisponiblesResueltos.length > 0) {
            let resultadoValidacion = null;
            for (const apartamentosDisponible of apartamentosDisponiblesResueltos) {
                if (apartamentoIDV === apartamentosDisponible) {
                    resultadoValidacion = apartamentoIDV;
                }
            }
            const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            });
            const nuevoApartamentoEnReserva = await insertarApartamentoEnReserva({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamento.apartamentoUI
            })

            await actualizadorIntegradoDesdeInstantaneas(reservaUID)
            await campoDeTransaccion("confirmar")

            const ok = {
                ok: "Apartamento añadido correctamente",
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamento.apartamentoUI,
                nuevoUID: nuevoApartamentoEnReserva.componenteUID,
            }
            return ok
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (semaforoCompartidoReserva) {
            semaforoCompartidoReserva.release()
        }
    }
}