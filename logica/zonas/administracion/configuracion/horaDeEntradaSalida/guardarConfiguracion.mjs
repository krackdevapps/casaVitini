import { DateTime } from "luxon";
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const guardarConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const horaEntradaTZ = validadoresCompartidos.tipos.horas({
            hola: entrada.body.horaEntradaTZ,
            nombreCampo: "El campo de la hora de entrada"
        })
        const horaSalidaTZ = validadoresCompartidos.tipos.horas({
            hola: entrada.body.horaSalidaTZ,
            nombreCampo: "El campo de la hora de entrada"
        })
        
        // Parsear las cadenas de hora a objetos DateTime de Luxon
        const horaEntradaControl = DateTime.fromFormat(horaEntradaTZ, 'HH:mm');
        const horaSalidaControl = DateTime.fromFormat(horaSalidaTZ, 'HH:mm');
        // Comparar las horas
        if (horaSalidaControl >= horaEntradaControl) {
            const error = "La hora de entrada no puede ser anterior o igual a la hora de salida. Los pernoctantes primero salen del apartamento a su hora de salida y luego los nuevos pernoctantes entran en el apartamento a su hora de entrada. Por eso la hora de entrada tiene que ser mas tarde que al hora de salida. Por que primero salen del apartamento ocupado, el apartmento entonces pasa a estar libre y luego entran los nuevo pernoctantes al apartamento ahora libre de los anteriores pernoctantes.";
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const configuracionUID_horaEntradaTZ = "horaEntradaTZ";
        const configuracionUID_horaSalidaTZ = "horaSalidaTZ";
        const actualizarConfiguracionGlobal = `
                                UPDATE "configuracionGlobal"
                                SET
                                    valor = CASE
                                        WHEN "configuracionUID" = $2 THEN $1
                                        WHEN "configuracionUID" = $4 THEN $3
                                        ELSE valor
                                    END
                                WHERE
                                    "configuracionUID" IN ($2, $4);
                                `;
        const nuevaConfiguracion = [
            horaEntradaTZ,
            configuracionUID_horaEntradaTZ,
            horaSalidaTZ,
            configuracionUID_horaSalidaTZ
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