import { conexion } from "../../componentes/db.mjs";
import { VitiniIDX } from "../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../sistema/vitiniCrypto.mjs";

export const actualizarClaveUsuarioDesdeMicasa = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return

        const usuarioIDX = entrada.session.usuario;
        const claveActual = entrada.body.claveActual;
        const claveNueva = entrada.body.claveNueva;
        const claveConfirmada = entrada.body.claveConfirmada;

        validadoresCompartidos.claves.minimoRequisitos(claveNueva);
        validadoresCompartidos.claves.minimoRequisitos(claveConfirmada);

        if (claveNueva !== claveConfirmada) {
            const error = "No has escrito dos veces la misma nueva contrasena, revisa las claves que has escrito y cerciorate que ambas claves nueva son iguales";
            throw new Error(error);
        }
        if (claveNueva === claveActual) {
            const error = "Has escrito una clave nueva que es la misma que la actual. Por favor revisa lo campos.";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const obtenerClaveActualHASH = `
                SELECT 
                clave,
                sal
                FROM usuarios
                WHERE usuario = $1;
                `;
        const resuelveObtenerClaveActualHASH = await conexion.query(obtenerClaveActualHASH, [usuarioIDX]);
        if (resuelveObtenerClaveActualHASH.rowCount === 0) {
            const error = "No existe el usuarios";
            throw new Error(error);
        }
        const claveActualHASH = resuelveObtenerClaveActualHASH.rows[0].clave;
        const sal = resuelveObtenerClaveActualHASH.rows[0].sal;
        const metadatos = {
            sentido: "comparar",
            clavePlana: claveActual,
            sal: sal,
            claveHash: claveActualHASH
        };
        const controlClave = vitiniCrypto(metadatos);
        if (!controlClave) {
            const error = "Revisa la contrasena actual que has escrito por que no es correcta por lo tanto no se puede cambiar la contrasena";
            throw new Error(error);
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
                "ok": "Se ha actualizado la nueva contrasena."
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}
