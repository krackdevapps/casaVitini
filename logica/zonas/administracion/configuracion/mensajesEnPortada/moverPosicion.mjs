import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const moverPosicion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const mensajeUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mensajeUID,
            nombreCampo: "El campo mensajeUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nuevaPosicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaPosicion,
            nombreCampo: "El campo nuevaPosicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const validarUID = `
                                SELECT 
                                    posicion,
                                    mensaje,
                                    estado
                                FROM 
                                    "mensajesEnPortada"
                                WHERE 
                                    uid = $1;
                               `;
        const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
        if (resuelveValidacion.rowCount === 0) {
            const error = "No existe ningun mensaje con ese UID";
            throw new Error(error);
        }


        const posicionAntigua = resuelveValidacion.rows[0].posicion;
        if (Number(posicionAntigua) === Number(nuevaPosicion)) {
            const error = "El mensaje ya esta en esa posicion";
            throw new Error(error);
        }
        const mensajeSeleccionado = {};
        const detallesMensajeSeleccionado = resuelveValidacion.rows[0];
        const mensajeSeleccionado_texto = detallesMensajeSeleccionado.mensaje;
        const bufferObjPreDecode = Buffer.from(mensajeSeleccionado_texto, "base64");

        mensajeSeleccionado.uid = mensajeUID;
        mensajeSeleccionado.mensaje = bufferObjPreDecode.toString("utf8");
        mensajeSeleccionado.estado = detallesMensajeSeleccionado.estado;
        const validarMensajeAfectado = `
                                SELECT 
                                    uid,
                                    mensaje,
                                    estado, 
                                    posicion
                                FROM 
                                    "mensajesEnPortada"
                                WHERE 
                                    posicion = $1;
                               `;
        const resuelveMensajeAfectado = await conexion.query(validarMensajeAfectado, [nuevaPosicion]);
        const detallesMensajeAfectado = resuelveMensajeAfectado.rows[0];


        const mensajeUIDAfectado = detallesMensajeAfectado.uid;
        const mensajeUIDAfectado_mensaje = detallesMensajeAfectado.mensaje;

        const buffer_mensajeAfectado = Buffer.from(mensajeUIDAfectado_mensaje, "base64");

        const mensajeAfectado = {
            uid: String(mensajeUIDAfectado),
            mensaje: buffer_mensajeAfectado.toString("utf8"),
            estado: detallesMensajeAfectado.estado
        };
        await conexion.query('BEGIN'); // Inicio de la transacción
        if (resuelveMensajeAfectado.rowCount === 1) {
            // Posicion de transccion
            const ajustarPosicionTransitivaElementoAfectado = `
                                      UPDATE 
                                          "mensajesEnPortada"
                                      SET 
                                          posicion = $2
                                      WHERE 
                                          uid = $1
                                      RETURNING
                                        mensaje,
                                        estado
                                         `;
            const resuelveMensajeSeleccionado = await conexion.query(ajustarPosicionTransitivaElementoAfectado, [mensajeUIDAfectado, 0]);


        }

        const actualizarMensajeActual = `
                                UPDATE 
                                    "mensajesEnPortada"
                                SET
                                    posicion = $1
                                WHERE
                                    uid = $2;`;

        await conexion.query(actualizarMensajeActual, [nuevaPosicion, mensajeUID]);

        if (resuelveMensajeAfectado.rowCount === 1) {
            // Posicion de final a elementoAfectado
            const ajustarPosicionFinalElementoAfectado = `
                                     UPDATE 
                                         "mensajesEnPortada"
                                     SET 
                                         posicion = $2
                                     WHERE 
                                         uid = $1;
                                      `;
            await conexion.query(ajustarPosicionFinalElementoAfectado, [mensajeUIDAfectado, posicionAntigua]);
        }


        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado correctamente la posicion",
            mensajeSeleccionado: mensajeSeleccionado,
            mensajeAfectado: mensajeAfectado
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}