import { Mutex } from "async-mutex";
import { apartamentosPorRango } from "../../../sistema/selectoresCompartidos/apartamentosPorRango.mjs";
import { insertarTotalesReserva } from "../../../sistema/reservas/insertarTotalesReserva.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/obtenerReservaPorReservaUID.mjs";
import { obtenerApartamentosDeLaReserva } from "../../../repositorio/reservas/apartamentos/obtenerApartamentosDeLaReserva.mjs";
import { insertarApartamentoEnReserva } from "../../../repositorio/reservas/apartamentos/insertarApartamentoEnReserva.mjs";


export const anadirApartamentoReserva = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();


        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reservaUID (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamento",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await eliminarBloqueoCaducado();
        // Validar que le nombre del apartamento existe como tal
        await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
        // valida reserva y obten fechas

        const detallesReserva = await obtenerReservaPorReservaUID(reservaUID)
        if (detallesReserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        const fechaEntrada_ISO = detallesReserva.fechaEntrada;
        const fechaSalida_ISO = detallesReserva.fechaSalida;
        // ACABAR ESTA SENTENCIA DE ABAJO--
        // validar que el apartamento no este ya en la reserva
        const apartamentoReserva = await obtenerApartamentosDeLaReserva({
            reservaUID: reservaUID,
            apartamentoIDV: apartamentoIDV
        })
        if (apartamentoReserva.length > 0) {
            const error = "El apartamento ya existe en la reserva";
            throw new Error(error);
        }
        const rol = entrada.session.rol;
        const configuracionApartamentosPorRango = {
            fechaEntrada_ISO: fechaEntrada_ISO,
            fechaSalida_ISO: fechaSalida_ISO,
            rol: rol,
            origen: "administracion"
        };
        const resuelveApartamentosDisponibles = await apartamentosPorRango(configuracionApartamentosPorRango);
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
            const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
            const nuevoApartamentoEnReserva = await insertarApartamentoEnReserva({
                reservaUID: reservaUID,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            })
            const transaccionPrecioReserva = {
                tipoProcesadorPrecio: "uid",
                reservaUID: reservaUID
            };
            await insertarTotalesReserva(transaccionPrecioReserva);
            const ok = {
                ok: "apartamento anadido correctamente",
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                nuevoUID: nuevoApartamentoEnReserva.componenteUID,
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}