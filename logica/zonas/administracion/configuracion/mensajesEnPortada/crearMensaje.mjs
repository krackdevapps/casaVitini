import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const crearMensaje = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const mensaje = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensaje,
            nombreCampo: "El campo del mensaje",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const bufferObj = Buffer.from(mensaje, "utf8");
        const mensajeB64 = bufferObj.toString("base64");

        await conexion.query('BEGIN'); // Inicio de la transacción
        const consultaPosicionInicial = `
                                SELECT 
                                    *
                                FROM 
                                    "mensajesEnPortada";
                               `;
        const resuelvePosicionInicial = await conexion.query(consultaPosicionInicial);
        const posicionInicial = resuelvePosicionInicial.rowCount + 1;

        const estadoInicial = "desactivado";
        const crearMensaje = `
                                INSERT INTO "mensajesEnPortada"
                                (
                                mensaje,
                                estado,
                                posicion
                                )
                                VALUES 
                                ($1, $2, $3)
                                RETURNING
                                uid
                                `;


        const resuelveCreacion = await conexion.query(crearMensaje, [mensajeB64, estadoInicial, posicionInicial]);


        if (resuelveCreacion.rowCount === 0) {
            const error = "No se ha podido insertar el mensaje";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha creado el nuevo mensaje",
            mensajeUID: resuelveCreacion.rows[0].mensajeUID,
        };
        salida.json(ok);
        await conexion.query('COMMIT');
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}