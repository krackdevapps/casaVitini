import { Mutex } from "async-mutex";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { insertarCliente } from "../../../sistema/insertarCliente.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";



export const crearCliente = async (entrada, salida) => {
    const mutex = new Mutex();
    let bloqueoCrearCliente
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        bloqueoCrearCliente = await mutex.acquire();

        let nombre = entrada.body.nombre;
        let primerApellido = entrada.body.primerApellido;
        let segundoApellido = entrada.body.segundoApellido;
        let pasaporte = entrada.body.pasaporte;
        let telefono = entrada.body.telefono;
        let correoElectronico = entrada.body.correo;
        let notas = entrada.body.notas;
        const nuevoCliente = {
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
            correoElectronico: correoElectronico,
            notas: notas,
        };
        const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoCliente);
        const nuevoUIDCliente = await insertarCliente(datosValidados);
        if (nuevoUIDCliente) {
            const ok = {
                ok: "Se ha anadido correctamente el cliente",
                nuevoUIDCliente: nuevoUIDCliente.uid
            };
            salida.json(ok);
        } else {
            const error = "Ha ocurrido un error interno y no se ha podido obtener el nuevo UID de cliente";
            throw new Error(error);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        bloqueoCrearCliente();
    }
}