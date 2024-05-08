import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { insertarCliente } from "../../../sistema/clientes/insertarCliente.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";


export const guardarNuevoClienteYSustituirloPorElClientePoolActual = async (entrada, salida) => {
    let mutex
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        mutex = new Mutex();
        await mutex.acquire();


        const reserva = validadoresCompartidos.tipos.numero({
            string: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const pernoctanteUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.pernoctanteUID,
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
        const resuelveReserva = await validadoresCompartidos.reservas.validarReserva(reserva)
        if (resuelveReserva.estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        // validar pernoctante y extraer el UID del clientePool
        const validacionPernoctante = `
                        SELECT 
                        "clienteUID"
                        FROM 
                        "reservaPernoctantes"
                        WHERE 
                        reserva = $1 AND "pernoctanteUID" = $2
                        `;
        const resuelveValidacionPernoctante = await conexion.query(validacionPernoctante, [reserva, pernoctanteUID]);
        if (resuelveValidacionPernoctante.rowCount === 0) {
            const error = "No existe el pernoctanteUID dentro de esta reserva";
            throw new Error(error);
        }
        const clienteUID = resuelveValidacionPernoctante.rows[0].clienteUID;
        if (clienteUID) {
            const error = "El pernoctnte ya es un cliente y no un clientePool";
            throw new Error(error);
        }
        const ok = {};
        const nuevoClienteAdd = await insertarCliente(datosValidados);
        const nuevoUIDCliente = nuevoClienteAdd.uid;
        // Borrar clientePool
        const eliminarClientePool = `
                        DELETE FROM "poolClientes"
                        WHERE "pernoctanteUID" = $1;`;
        const resuelveEliminarClientePool = await conexion.query(eliminarClientePool, [pernoctanteUID]);
        if (resuelveEliminarClientePool.rowCount === 0) {
            ok.informacion = "No se ha encontrado un clientePool asociado al pernoctante";
        }
        const actualizaPernoctanteReserva = `
                            UPDATE "reservaPernoctantes"
                            SET "clienteUID" = $3
                            WHERE reserva = $1 AND "pernoctanteUID" = $2
                            RETURNING
                            habitacion;
                            `;
        const resuelveActualizaPernoctanteReserva = await conexion.query(actualizaPernoctanteReserva, [reserva, pernoctanteUID, nuevoUIDCliente]);
        if (resuelveActualizaPernoctanteReserva.rowCount === 0) {
            const error = "No se ha podido actualizar al pernoctante dentro de la reserva";
            throw new Error(error);
        }
        if (resuelveActualizaPernoctanteReserva.rowCount === 1) {
            const habitacionUID = resuelveActualizaPernoctanteReserva.rows[0].habitacion;
            primerApellido = primerApellido ? primerApellido : "";
            segundoApellido = segundoApellido ? segundoApellido : "";

            ok.ok = "Se ha guardado al nuevo cliente y sustituido por el clientePool, tambien se ha eliminado al clientePool de la base de datos";
            ok.nuevoClienteUID = nuevoUIDCliente;
            ok.nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
            ok.pasaporte = pasaporte;
            ok.habitacionUID = habitacionUID;
        }
        salida.json(ok);

    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {

        if (mutex) {
            mutex.release()
        }
    }
}