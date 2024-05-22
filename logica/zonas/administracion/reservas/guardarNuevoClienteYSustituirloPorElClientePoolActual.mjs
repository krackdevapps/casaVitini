import { Mutex } from "async-mutex";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { insertarCliente } from "../../../repositorio/clientes/insertarCliente.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { obtenerPernoctanteDeLaReservaPorPernoctaneUID } from "../../../repositorio/reservas/pernoctantes/obtenerPernoctanteDeLaReservaPorPernoctaneUID.mjs";
import { actualizarClienteUIDDelPernoctantePorComponenteUID } from "../../../repositorio/reservas/pernoctantes/actualizarClienteUIDDelPernoctantePorComponenteUID.mjs";

export const guardarNuevoClienteYSustituirloPorElClientePoolActual = async (entrada, salida) => {
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
            nombreCampo: "El identificador reservaUID de la reservaUID",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.pernoctanteUID,
            nombreCampo: "El identificador universal de la pernoctante (pernoctanteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const nuevoCliente = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            telefono: entrada.body.telefono,
            correoElectronico: entrada.body.correoElectronico
        };
        const datosValidados = await validadoresCompartidos.clientes.validarCliente(nuevoCliente);

        // Comprobar que la reserva exisste
        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        // validar pernoctante y extraer el UID del clientePool
        const pernoctante = await obtenerPernoctanteDeLaReservaPorPernoctaneUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID
        })
        if (!pernoctante.componenteUID) {
            const error = "No existe el pernoctanteUID dentro de esta reserva";
            throw new Error(error);
        }
        const clienteUID = pernoctante.clienteUID;
        if (clienteUID) {
            const error = "El pernoctnte ya es un cliente y no un clientePool";
            throw new Error(error);
        }
        const nuevoClienteAdd = await insertarCliente(datosValidados);
        const nuevoUIDCliente = nuevoClienteAdd.uid;
        // Borrar clientePool       
        await eliminarClientePool(pernoctanteUID)
        const pernoctanteActualizado = await actualizarClienteUIDDelPernoctantePorComponenteUID({
            reservaUID: reservaUID,
            pernoctanteUID: pernoctanteUID,
            clienteUID: nuevoUIDCliente
        })

        const habitacionUID = pernoctanteActualizado.habitacion;
        primerApellido = primerApellido ? primerApellido : "";
        segundoApellido = segundoApellido ? segundoApellido : "";
        const ok = {
            ok: "Se ha guardado al nuevo cliente y sustituido por el clientePool, tambien se ha eliminado al clientePool de la base de datos",
            nuevoClienteUID: nuevoUIDCliente,
            nombreCompleto: `${nombre} ${primerApellido} ${segundoApellido}`,
            pasaporte: pasaporte,
            habitacionUID: habitacionUID,
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}