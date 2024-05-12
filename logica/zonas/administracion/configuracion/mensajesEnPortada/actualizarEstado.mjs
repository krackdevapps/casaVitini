import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const actualizarEstado = async (entrada, salida) => {
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

        const estado = validadoresCompartidos.tipos.cadena({
            string: entrada.body.estado,
            nombreCampo: "El estado",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await conexion.query('BEGIN'); // Inicio de la transacción
        const validarUID = `
                                SELECT 
                                    "estado"
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

        const actualizarMensaje = `
                                UPDATE 
                                    "mensajesEnPortada"
                                SET
                                    estado = $1
                                WHERE
                                    uid = $2;`;
        const resuelveActualizacion = await conexion.query(actualizarMensaje, [estado, mensajeUID]);
        if (resuelveActualizacion.rowCount === 0) {
            const error = "No se ha podido actualizar el mensaje por que no se ha encontrado";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado el estado correctamente",
            mensajeUID: mensajeUID,
            estado: estado
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }

}