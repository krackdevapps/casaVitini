import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validarServicio } from "../../../shared/servicios/validarObjeto.mjs";
import { insertarServicio } from "../../../infraestructure/repository/servicios/insertarServicio.mjs";

export const crearServicio = async (entrada) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const servicio = {
            nombreServicio: entrada.body.nombreServicio,
            zonaIDV: entrada.body.zonaIDV,
            contenedor: entrada.body.contenedor
        };

        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            nuevoServicio.testingVI = testingVI
        }

        await validarServicio({
            servicio: servicio,
        })
        servicio.estadoIDV = "desactivado"
        const nuevoServicio = await insertarServicio(servicio);
        if (nuevoServicio) {
            const ok = {
                ok: "Se ha añadido correctamente el servicio",
                nuevoServicioUID: nuevoServicio.servicioUID
            };
            return ok
        } else {
            const error = "Ha ocurrido un error interno y no se ha podido obtener el nuevo servicio";
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