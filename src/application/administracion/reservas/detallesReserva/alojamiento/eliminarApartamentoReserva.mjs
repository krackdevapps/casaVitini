import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { bloquearApartamentos } from "../../../../../shared/bloqueos/bloquearApartamentos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarApartamentoPorReservaUIDPorApartamentoUID } from "../../../../../infraestructure/repository/reservas/apartamentos/eliminarApartamentoPorReservaUIDPorApartamentoUID.mjs";

export const eliminarApartamentoReserva = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();
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
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const apartamentoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoUID,
            nombreCampo: "El identificador universal de la reserva (apartamentoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
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


        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }

        const estadoInfomracionFinanciera = "actualizar";
        const fechaEntrada = reserva.fechaEntrada;
        const fechaSalida = reserva.fechaSalida;




        if (tipoBloqueo === "permanente" || tipoBloqueo === "rangoTemporal") {
            await bloquearApartamentos({
                reservaUID,
                apartamentoUID,
                tipoBloqueo,
                fechaEntrada,
                fechaSalida,
                zonaIDV: "publica",
                origen: "eliminacionApartamentoDeReserva"
            })
        }






        await eliminarApartamentoPorReservaUIDPorApartamentoUID({
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
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}