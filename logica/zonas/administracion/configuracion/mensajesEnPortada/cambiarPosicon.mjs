import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const cambiarPosicon = async (entrada, salida) => {
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
        const posicion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.posicion,
            nombreCampo: "El campo posicion",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const mensajeB64 = btoa(mensaje);

        const validarUID = `
                                SELECT 
                                    "estado"
                                FROM 
                                    "mensajeEnPortada"
                                WHERE 
                                    "mensajeUID" = $1;
                               `;
        const resuelveValidacion = await conexion.query(validarUID, [mensajeUID]);
        if (resuelveValidacion.rowCount === 0) {
            const error = "No existe ningun mensaje con ese UID";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarMensaje = `
                                UPDATE 
                                    "mensajeEnPortada"
                                SET
                                    mensaje = $1
                                WHERE
                                    "mensajeUID" = $2
                                    RETURNING *;`;
        const datosDelMensaje = [
            mensajeB64,
            mensajeUID
        ];
        const resuelveActualizacion = await conexion.query(actualizarMensaje, datosDelMensaje);
        if (resuelveActualizacion.rowCount === 0) {
            const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
            throw new Error(error);
        }
        const mensajeGuardado = resuelveEstado.rows[0].mensaje;
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado correctamente la posicion del mensaje",
            mensajeUID: mensajeUID,
            mensaje: atob(mensajeGuardado)
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}