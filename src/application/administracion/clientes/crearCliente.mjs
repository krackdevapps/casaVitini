import { Mutex } from "async-mutex";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { insertarCliente } from "../../../infraestructure/repository/clientes/insertarCliente.mjs";


export const crearCliente = async (entrada, salida) => {
    const mutex = new Mutex();
    try {


        await mutex.acquire();
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 7
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

        const datosValidados = await validadoresCompartidos.clientes.validarCliente({
            cliente: nuevoCliente,
            operacion: "crear"
        });

        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            datosValidados.testingVI = testingVI
        }

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