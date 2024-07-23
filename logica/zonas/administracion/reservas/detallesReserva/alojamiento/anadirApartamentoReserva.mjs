import { Mutex } from "async-mutex";
import { apartamentosPorRango } from "../../../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { insertarApartamentoEnReserva } from "../../../../../repositorio/reservas/apartamentos/insertarApartamentoEnReserva.mjs";
import { obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID } from "../../../../../repositorio/reservas/apartamentos/obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../sistema/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";

export const anadirApartamentoReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

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
        // Validar que le nombre del apartamento existe como tal
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        // valida reserva y obten fechas

        const detallesReserva = await obtenerReservaPorReservaUID(reservaUID)
        if (detallesReserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")

        const fechaEntrada = detallesReserva.fechaEntrada;
        const fechaSalida = detallesReserva.fechaSalida;
        // ACABAR ESTA SENTENCIA DE ABAJO--
        // validar que el apartamento no este ya en la reserva
        const apartamentoReserva = await obtenerApartamentoDeLaReservaPorApartamentoIDVPorReservaUID({
            reservaUID: reservaUID,
            apartamentoIDV: apartamentoIDV
        })
        if (apartamentoReserva?.apartamentoIDV) {
            const error = "El apartamento ya existe en la reserva";
            throw new Error(error);
        }
        const rol = entrada.session.rol;

        const resuelveApartamentosDisponibles = await apartamentosPorRango({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            zonaConfiguracionAlojamientoArray: ["privada", "global"],
            zonaBloqueo_array: ["privada", "global"],
        })
        const apartamentosDisponiblesResueltos = resuelveApartamentosDisponibles.apartamentosDisponibles;
        if (apartamentosDisponiblesResueltos.length === 0) {
            const error = "No hay ningun apartamento disponbile para las fechas de la reserva";
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
                ok: "apartamento anadido correctamente",
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
        if (mutex) {
            mutex.release()
        }
    }
}