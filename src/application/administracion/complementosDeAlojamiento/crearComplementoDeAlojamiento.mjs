import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validarServicio } from "../../../shared/servicios/validarObjeto.mjs";
import { insertarServicio } from "../../../infraestructure/repository/servicios/insertarServicio.mjs";
import { validarObjeto } from "../../../shared/complementosDeAlojamiento/validarObjeto.mjs";
import { insertarComplemento } from "../../../infraestructure/repository/complementosDeAlojamiento/insertarComplemento.mjs";

export const crearComplementoDeAlojamiento = async (entrada) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();
        await validarObjeto(entrada.body)
        const complementoNuevo = {
            apartamentoIDV : entrada.body.apartamentoIDV,
            complementoUI: entrada.body.complementoUI,
            definicion: entrada.body.definicion,
            tipoPrecio: entrada.body.tipoPrecio,
            precio: entrada.body.precio,
        }
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            complementoNuevo.testingVI = testingVI
        }
        complementoNuevo.estadoIDV = "desactivado"
        const nuevoComplemento = await insertarComplemento(complementoNuevo);
        if (nuevoComplemento) {
            const ok = {
                ok: "Se ha añadido correctamente el servicio",
                nuevoComplementoUID: nuevoComplemento.complementoUID,
                apartamentoIDV: nuevoComplemento.apartamentoIDV
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