import { Mutex } from "async-mutex";

import { validarObjeto } from "../../../shared/complementosDeAlojamiento/validarObjeto.mjs";
import { insertarComplemento } from "../../../infraestructure/repository/complementosDeAlojamiento/insertarComplemento.mjs";


export const crearComplementoDeAlojamiento = async (entrada) => {
    const mutex = new Mutex();
    try {


        await mutex.acquire();
        const oV = await validarObjeto({
            o: entrada.body,
            modo: "crear"
        })
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            oV.testingVI = testingVI
        }
        oV.estadoIDV = "desactivado"
        const nuevoComplemento = await insertarComplemento(oV);
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