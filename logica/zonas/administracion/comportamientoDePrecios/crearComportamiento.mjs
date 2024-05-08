import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { evitarDuplicados } from "../../../sistema/precios/comportamientoPrecios/evitarDuplicados.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const crearComportamiento = async (entrada, salida) => {
    let mutex;
    try {
        await mutex.acquire();
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        mutex = new Mutex()
        await mutex.acquire();
        const nombreComportamiento = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreComportamiento,
            nombreCampo: "El campo del nombreComportamiento",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        await conexion.query('BEGIN'); // Inicio de la transacción

        const dataEvitarDuplicados = {
            nombreComportamiento: nombreComportamiento,
            transaccion: "actualizar",
        };

        await evitarDuplicados(dataEvitarDuplicados);
        await conexion.query('COMMIT');
        const ok = {
            ok: "Se ha creado correctamente el comportamiento",
            nuevoUIDComportamiento: nuevoUIDComportamiento
        };
        salida.json(ok);


    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}