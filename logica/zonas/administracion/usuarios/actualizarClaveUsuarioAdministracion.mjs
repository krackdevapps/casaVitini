import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../sistema/vitiniCrypto.mjs";


export const actualizarClaveUsuarioAdministracion = async (entrada, salida) => {
    try {
        const usuarioIDX = entrada.body.usuarioIDX;
        const claveNueva = entrada.body.claveNueva;
        const claveNuevaDos = entrada.body.claveNuevaDos;
        const filtro_minúsculas_numeros = /^[a-z0-9]+$/;
        if (!usuarioIDX || !filtro_minúsculas_numeros.test(usuarioIDX)) {
            const error = "El campo usuarioIDX solo admite minúsculas y numeros";
            throw new Error(error);
        }
        if (claveNueva !== claveNuevaDos) {
            const error = "No has escrito dos veces la misma nueva contrasena";
            throw new Error(error);
        } else {
            validadoresCompartidos.claves.minimoRequisitos(claveNueva);
        }
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: claveNueva
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarClave = `
                            UPDATE usuarios
                            SET 
                                clave = $1,
                                sal = $2
                            WHERE 
                                usuario = $3
                            `;
        const datos = [
            hashCreado,
            nuevaSal,
            usuarioIDX
        ];
        const resuelveActualizarClave = await conexion.query(actualizarClave, datos);
        if (resuelveActualizarClave.rowCount === 1) {
            const ok = {
                "ok": "Se ha actualizado la nueva clave"
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}