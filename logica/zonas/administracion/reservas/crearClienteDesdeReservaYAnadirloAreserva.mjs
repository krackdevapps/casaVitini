import { Mutex } from "async-mutex";
import { insertarCliente } from "../../../repositorio/clientes/insertarCliente.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerHabitacionDelLaReserva } from "../../../repositorio/reservas/apartamentos/obtenerHabitacionDelLaReserva.mjs";
import { insertarPernoctanteEnLaHabitacion } from "../../../repositorio/reservas/pernoctantes/insertarPernoctanteEnLaHabitacion.mjs";

export const crearClienteDesdeReservaYAnadirloAreserva = async (entrada, salida) => {
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
            nombreCampo: "El identificador universal de la reservaUID ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const habitacionUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la reservhabitacionUIDa ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const resolverReserva = await validadoresCompartidos.reservas.validarReserva(reserva)
        if (resolverReserva.estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        // validar habitacion
        await obtenerHabitacionDelLaReserva({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID
        })

        const nuevoCliente = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            telefono: entrada.body.telefono,
            correoElectronico: entrada.body.correoElectronico,
            notas: entrada.body.notas,
        };
        const datosValidados = await validadoresCompartidos.clientes.validarCliente(nuevoCliente);

        const nuevoClienteInsertado = await insertarCliente(datosValidados);
        const nuevoUIDCliente = nuevoClienteInsertado.uid;

        const nuevoPernoctaneInsertado = await insertarPernoctanteEnLaHabitacion({
            reservaUID: reservaUID,
            habitacionUID: habitacionUID,
            clienteUID: clienteUID
        })
        const ok = {
            ok: "Se ha anadido correctamente el cliente en la habitacin de la reserva",
            nuevoUIDPernoctante: nuevoPernoctaneInsertado.componenteUID,
            nuevoUIDCliente: nuevoUIDCliente,
            nuevoCliente: {
                nombre: datosValidados.nombre,
                primerApellido: datosValidados.primerApellido,
                segundoApellido: datosValidados.segundoApellido,
                pasaporte: datosValidados.pasaporte,
                telefono: datosValidados.telefono,
                correoElectronico: datosValidados.correoElectronico
            }
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}