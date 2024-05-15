import { DateTime } from "luxon";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const restablecerClave = async (entrada, salida) => {
    try {
        const codigo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.codigo,
            nombreCampo: "El codigo de verificación",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const clave = entrada.body.clave;
        const claveConfirmada = entrada.body.claveConfirmada;

        validadoresCompartidos.claves.minimoRequisitos(clave);
        validadoresCompartidos.claves.minimoRequisitos(claveConfirmada);
        
        if (clave !== claveConfirmada) {
            const error = "Las claves no coinciden. Por favor escribe tu nueva clave dos veces.";
            throw new Error(error);
        }

        const fechaActual_ISO = DateTime.utc().toISO();
        const eliminarEnlacesCaducados = `
            DELETE FROM "enlaceDeRecuperacionCuenta"
            WHERE "fechaCaducidad" < $1;
            `;
        await conexion.query(eliminarEnlacesCaducados, [fechaActual_ISO]);
        await campoDeTransaccion("iniciar")   
        const consultaValidarCodigo = `
                SELECT 
                usuario
                FROM "enlaceDeRecuperacionCuenta"
                WHERE codigo = $1;
                `;
        const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [codigo]);
        if (resuelveValidarCodigo.rowCount === 0) {
            const error = "El código que has introducido no existe. Si estás intentando recuperar tu cuenta, recuerda que los códigos son de un solo uso y duran una hora. Si has generado varios códigos, solo es válido el más nuevo.";
            throw new Error(error);
        }
        if (resuelveValidarCodigo.rowCount === 1) {
            const usuario = resuelveValidarCodigo.rows[0].usuario;
            const crypto = {
                sentido: "cifrar",
                clavePlana: clave
            };
            const retorno = vitiniCrypto(crypto);
            const nuevaSal = retorno.nuevaSal;
            const hashCreado = retorno.hashCreado;
            const restablecerClave = `
                UPDATE 
                usuarios
                SET
                sal = $1,
                clave = $2
                WHERE
                usuario = $3;
                `;
            const datosRestablecimiento = [
                nuevaSal,
                hashCreado,
                usuario
            ];
            await conexion.query(restablecerClave, datosRestablecimiento);
            const eliminarEnlaceUsado = `
                DELETE FROM "enlaceDeRecuperacionCuenta"
                WHERE usuario = $1;
                `;
            await conexion.query(eliminarEnlaceUsado, [usuario]);
            await campoDeTransaccion("confirmar")
            const ok = {
                ok: "El enlace temporal sigue vigente",
                usuario: usuario
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        console.info(errorCapturado.message);
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}