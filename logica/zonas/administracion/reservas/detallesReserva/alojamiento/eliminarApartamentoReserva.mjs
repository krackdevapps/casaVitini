import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { bloquearApartamentos } from "../../../../../sistema/bloqueos/bloquearApartamentos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../../../repositorio/globales/campoDeTransaccion.mjs";
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../sistema/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs";

export const eliminarApartamentoReserva = async (entrada, salida) => {
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

        const apartamentoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoUID,
            nombreCampo: "El identificador universal de la reserva (apartamentoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const tipoBloqueo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBloqueo,
            nombreCampo: "El nombre de tipoBloqueo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "sinBloqueo") {
            const error = "El campo 'tipoBloqueo' solo puede ser 'permanente', 'rangoTemporal', 'sinBloquo'";
            throw new Error(error);
        }

        await campoDeTransaccion("iniciar")

        // Comprobar que la reserva exisste     
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        // Comprobar si existen totales en esta reserva
        const estadoInfomracionFinanciera = "actualizar";
        const fechaEntrada_ISO = reserva.fechaEntrada;
        const fechaSalida_ISO = reserva.fechaSalida;

        if (tipoBloqueo === "permanente" || tipoBloqueo === "rangoTemporal") {
            const metadatos = {
                reserva: reservaUID,
                apartamentoUID: apartamentoUID,
                tipoBloqueo: tipoBloqueo,
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                zonaBloqueo: "publico",
                origen: "eliminacionApartamentoDeReserva"
            };
            await bloquearApartamentos(metadatos);

        }
        await eliminarApartamentoReserva({
            reservaUID: reservaUID,
            apartamentoUID: apartamentoUID
        })   
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {};
        ok.estadoDesgloseFinanciero = estadoInfomracionFinanciera;
        if (tipoBloqueo === "rangoTemporal") {
            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo temporal";
        }
        if (tipoBloqueo === "permanente") {
            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo permanente";
        }
        if (tipoBloqueo === "sinBloqueo") {
            ok.ok = "Se ha eliminado el apartamento de la reserva y se ha liberado";
        }
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}