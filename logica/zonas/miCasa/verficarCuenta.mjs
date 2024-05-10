import { conexion } from "../../componentes/db.mjs";
import { eliminarCuentasNoVerificadas } from "../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

export const verificarCuenta = async (entrada, salida) => {
    try {
        const codigo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.codigo,
            nombreCampo: "El tipo valor",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })


        await eliminarCuentasNoVerificadas();
        await conexion.query('BEGIN'); // Inicio de la transacción   
        const estadoVerificado = "si";
        const consultaValidarCodigo = `
            UPDATE 
            usuarios
            SET
            "cuentaVerificada" = $1,
            "codigoVerificacion" = NULL,
            "fechaCaducidadCuentaNoVerificada" = NULL
            WHERE
            "codigoVerificacion" = $2
            RETURNING
            usuario
            `;
        const resuelveValidarCodigo = await conexion.query(consultaValidarCodigo, [estadoVerificado, codigo]);
        if (resuelveValidarCodigo.rowCount === 0) {
            const error = "El codigo que has introducino no existe";
            throw new Error(error);
        }
        if (resuelveValidarCodigo.rowCount === 1) {
            const usuario = resuelveValidarCodigo.rows[0].usuario;
            const ok = {
                ok: "Cuenta verificada",
                usuario: usuario
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        console.info(errorCapturado.message);
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}