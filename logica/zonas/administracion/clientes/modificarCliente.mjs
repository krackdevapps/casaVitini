import { Mutex } from "async-mutex";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { obtenerDetallesCliente } from "../../../repositorio/clientes/obtenerDetallesCliente.mjs";
import { actualizarCliente } from "../../../repositorio/clientes/actualizarCliente.mjs";

export const modificarCliente = async (entrada, salida) => {
    const mutex = new Mutex();
    let bloqueoModificarClinete
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        bloqueoModificarClinete = await mutex.acquire();
        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no",
            devuelveUnTipoNumber: "si"
        })

        const datosDelCliente = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            telefono: entrada.body.telefono,
            correoElectronico: entrada.body.correoElectronico,
            notas: entrada.body.notas,
            clienteUID
        }
        const datosValidados = await validadoresCompartidos.clientes.validarCliente({
            cliente: datosDelCliente,
            operacion: "actualizar"
        });
        //await obtenerDetallesCliente(clienteUID)
        const clienteActualziado = await actualizarCliente(datosValidados)
        const ok = {
            ok: "Se ha anadido correctamente el cliente",
            detallesCliente: clienteActualziado
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        
        bloqueoModificarClinete();
    }
}