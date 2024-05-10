import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const datosCuentaIDX = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const consultaDetallesUsuario = `
                            SELECT 
                            usuario, 
                            rol,
                            "estadoCuenta"
                            FROM 
                            usuarios
                            WHERE 
                            usuario = $1;`;
        const resolverConsultaDetallesUsuario = await conexion.query(consultaDetallesUsuario, [usuarioIDX]);
        if (resolverConsultaDetallesUsuario.rowCount === 0) {
            const error = "No existe ningun usuario con ese IDX";
            throw new Error(error);
        }
        const detallesCliente = resolverConsultaDetallesUsuario.rows[0];
        const ok = {
            ok: detallesCliente
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}