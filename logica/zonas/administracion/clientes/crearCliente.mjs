import { Mutex } from "async-mutex";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { insertarCliente } from "../../../repositorio/clientes/insertarCliente.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const crearCliente = async (entrada, salida) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const nuevoCliente = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            telefono: entrada.body.telefono,
            correoElectronico: entrada.body.correoElectronico,
            notas: entrada.body.notas,
        };

        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            nuevoCliente.testingVI = testingVI
        }

        const datosValidados = await validadoresCompartidos.clientes.validarCliente({
            cliente: nuevoCliente,
            operacion: "crear"
        });
        const nuevoUIDCliente = await insertarCliente(datosValidados);
        if (nuevoUIDCliente) {
            const ok = {
                ok: "Se ha añadido correctamente el cliente",
                nuevoUIDCliente: nuevoUIDCliente.clienteUID
            };
            return ok
        } else {
            const error = "Ha ocurrido un error interno y no se ha podido obtener el nuevo UID de cliente";
            throw new Error(error);
        }
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}