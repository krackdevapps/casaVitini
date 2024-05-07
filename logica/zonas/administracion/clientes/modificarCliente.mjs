import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const modificarCliente = async (entrada, salida) => {
    const mutex = new Mutex();
    let bloqueoModificarClinete
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        bloqueoModificarClinete = await mutex.acquire();
        const cliente = validadoresCompartidos.tipos.numero({
            string: entrada.body.cliente,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const datosDelCliente = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            telefono: entrada.body.telefono,
            correoElectronico: entrada.body.correoElectronico,
            notas: entrada.body.notas,
        };
        const datosValidados = await validadoresCompartidos.clientes.validarCliente(datosDelCliente);
        nombre = datosValidados.nombre;
        primerApellido = datosValidados.primerApellido;
        segundoApellido = datosValidados.segundoApellido;
        pasaporte = datosValidados.pasaporte;
        telefono = datosValidados.telefono;
        correoElectronico = datosValidados.correoElectronico;
        notas = datosValidados.notas;
        const validarCliente = `
                            SELECT
                            uid
                            FROM 
                            clientes
                            WHERE
                            uid = $1`;
        const resuelveValidarCliente = await conexion.query(validarCliente, [cliente]);
        if (resuelveValidarCliente.rowCount === 0) {
            const error = "No existe el cliente";
            throw new Error(error);
        }
        const actualizarCliente = `
                            UPDATE clientes
                            SET 
                            nombre = COALESCE($1, nombre),
                            "primerApellido" = COALESCE($2, "primerApellido"),
                            "segundoApellido" = COALESCE($3, "segundoApellido"),
                            pasaporte = COALESCE($4, pasaporte),
                            telefono = COALESCE($5, telefono),
                            email = COALESCE($6, email),
                            notas = COALESCE($7, notas)
                            WHERE uid = $8
                            RETURNING
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email,
                            notas;
                            `;
        const datosCliente = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            correoElectronico,
            notas,
            cliente
        ]
        const resuelveActualizarCliente = await conexion.query(actualizarCliente, datosCliente);
        if (resuelveActualizarCliente.rowCount === 0) {
            const error = "No se ha actualizado el cliente por que la base de datos no ha entontrado al cliente";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha anadido correctamente el cliente",
            detallesCliente: resuelveActualizarCliente.rows
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        bloqueoModificarClinete();
    }
}