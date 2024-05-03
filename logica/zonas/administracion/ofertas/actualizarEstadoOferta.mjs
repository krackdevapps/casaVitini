import { conexion } from "../../../componentes/db.mjs";


export const actualizarEstadoOferta = async (entrada, salida) => {
    await mutex.acquire();
    try {
        const ofertaUID = entrada.body.ofertaUID;
        const estadoOferta = entrada.body.estadoOferta;
        const filtroCadena = /^[a-z]+$/;
        if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
            const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
            throw new Error(error);
        }
        if (!estadoOferta || !filtroCadena.test(estadoOferta) || (estadoOferta !== "activada" && estadoOferta !== "desactivada")) {
            const error = "El campo estadoOferta solo admite minúsculas y nada mas, debe de ser un estado activada o desactivada";
            throw new Error(error);
        }
        // Validar nombre unico oferta
        const validarOferta = `
                            SELECT uid
                            FROM ofertas
                            WHERE uid = $1;
                            `;
        const resuelveValidarOferta = await conexion.query(validarOferta, [ofertaUID]);
        if (resuelveValidarOferta.rowCount === 0) {
            const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarEstadoOferta = `
                            UPDATE ofertas
                            SET "estadoOferta" = $2
                            WHERE uid = $1
                            RETURNING "estadoOferta";
                            `;
        const datos = [
            ofertaUID,
            estadoOferta,
        ];
        const resuelveEstadoOferta = await conexion.query(actualizarEstadoOferta, datos);
        const ok = {
            "ok": "El estado de la oferta se ha actualziado correctamente",
            "estadoOferta": resuelveEstadoOferta.rows[0].estadoOferta
        };
        salida.json(ok);
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }

}