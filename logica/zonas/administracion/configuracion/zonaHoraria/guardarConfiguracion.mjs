import { conexion } from "../../../../componentes/db.mjs";
import { zonasHorarias } from "../../../../componentes/zonasHorarias.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const guardarConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const zonaHoraria = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaHoraria,
            nombreCampo: "El campo del zonaHoraria",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        // Validar que la zona horarai exista
        const validarZonaHoraria = (zonaHorariaAValidar) => {
            let resultadoFinal = "no";
            const listaZonasHorarias = zonasHorarias();
            for (const zonaHoraria of listaZonasHorarias) {
                if (zonaHoraria === zonaHorariaAValidar) {
                    resultadoFinal = "si";
                }
            }
            return resultadoFinal;
        };
        if (validarZonaHoraria(zonaHoraria) === "no") {
            const error = "el campo 'zonaHorariaGlobal' no existe";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const actualizarConfiguracionGlobal = `
                                        UPDATE "configuracionGlobal"
                                        SET
                                          valor = $1
                                        WHERE
                                          "configuracionUID" = $2;
                                        `;
        const nuevaConfiguracion = [
            zonaHoraria,
            "zonaHoraria"
        ];
        const consultaValidarApartamento = await conexion.query(actualizarConfiguracionGlobal, nuevaConfiguracion);
        if (consultaValidarApartamento.rowCount === 0) {
            const error = "No se ha podido actualizar la configuracion, reintentalo";
            throw new Error(error);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "Se ha actualizado correctamente la configuracion"
        };
        salida.json(ok);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}