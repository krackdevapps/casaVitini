import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";


export const actualizarEstadoComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();

    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();

        const comportamientoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal de la comportamiento (comportamientoUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const estadoPropuesto = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estadoPropuesto,
            nombreCampo: "El estadoPropuesto",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        // Validar nombre unico oferta
        const validarOferta = `
                            SELECT uid
                            FROM "comportamientoPrecios"
                            WHERE uid = $1;
                            `;
        const resuelveValidarOferta = await conexion.query(validarOferta, [comportamientoUID]);
        if (resuelveValidarOferta.rowCount === 0) {
            const error = "No existe al oferta, revisa el UID introducie en el campo comportamientoUID, recuerda que debe de ser un number";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarEstadoOferta = `
                            UPDATE "comportamientoPrecios"
                            SET estado = $1
                            WHERE uid = $2
                            RETURNING estado;
                            `;
        const datos = [
            estadoPropuesto,
            comportamientoUID
        ];
        const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos);
        const ok = {
            ok: "El estado del comportamiento se ha actualziado correctamente",
            estadoComportamiento: resuelveEstadoOferta.rows[0].estado
        };
        salida.json(ok);
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        mutex.release();
    }
}