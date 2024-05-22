import { Mutex } from "async-mutex";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { insertarCliente } from "../../../repositorio/clientes/insertarCliente.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const crearCliente = async (entrada, salida) => {
    const mutex = new Mutex();
    let bloqueoCrearCliente
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        bloqueoCrearCliente = await mutex.acquire();

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
        const nuevoUIDCliente = await insertarCliente(datosValidados);
        if (nuevoUIDCliente) {
            const ok = {
                ok: "Se ha anadido correctamente el cliente",
                nuevoUIDCliente: nuevoUIDCliente.uid
            };
            return ok
        } else {
            const error = "Ha ocurrido un error interno y no se ha podido obtener el nuevo UID de cliente";
            throw new Error(error);
        }
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        bloqueoCrearCliente();
    }
}