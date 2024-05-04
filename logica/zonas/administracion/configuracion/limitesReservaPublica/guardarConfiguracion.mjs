import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const guardarConfiguracion = async (entrada, salida) => {  
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const diasAntelacionReserva = entrada.body.diasAntelacionReserva;
        const limiteFuturoReserva = entrada.body.limiteFuturoReserva;
        const diasMaximosReserva = entrada.body.diasMaximosReserva;
        const filtroNumero = /^\d+$/;
        if (!diasAntelacionReserva || !filtroNumero.test(diasAntelacionReserva)) {
            const error = "El campo diasAntelacionReserva solo acepta numeros";
            throw new Error(error);
        }
        if (!limiteFuturoReserva || !filtroNumero.test(limiteFuturoReserva)) {
            const error = "El campo limiteFuturoReserva solo acepta numeros";
            throw new Error(error);
        }
        if (!diasMaximosReserva || !filtroNumero.test(diasMaximosReserva)) {
            const error = "El campo diasMaximosReserva solo acepta numeros";
            throw new Error(error);
        }
        if (Number(diasAntelacionReserva) >= Number(limiteFuturoReserva)) {
            const error = "Los dias de antelacion no pueden ser iguales o superiores a los dias del limiteFuturoReserva por que entonces no se permiten reservas de mas de 0 dias";
            throw new Error(error);
        }
        if (0 === Number(limiteFuturoReserva)) {
            const error = "El limite futuro no puede ser de 0, por que entonces no se permite reservas de mas de 0 dias.";
            throw new Error(error);
        }
        if (0 === Number(diasMaximosReserva)) {
            const error = "No puedes determinar que el numero maximo de días de las reservas públicas sea de 0.";
            throw new Error(error);
        }
        const maximoDiasDuracionReserva = Number(limiteFuturoReserva) - Number(diasAntelacionReserva);
        if (Number(diasMaximosReserva) > Number(maximoDiasDuracionReserva)) {
            const error = `En base la configuracíon que solicitas, es decir en base a los dias minimos de antelación establecidos y el limite futuro de dias, las reservas tendrian un maximo de ${maximoDiasDuracionReserva} días de duracíon, por lo tanto no puedes establecer mas días de duracíon que eso. Es decir o escoges poner menos dias de duración maximo para una reserva o ampliar los limites anteriores.`;
            throw new Error(error);
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const configuracionUID_diasAntelacionReserva = "diasAntelacionReserva";
        const configuracionUID_limiteFuturoReserva = "limiteFuturoReserva";
        const configuracionUID_diasMaximosReserva = "diasMaximosReserva";
        const actualizarConfiguracionGlobal = `
                                UPDATE "configuracionGlobal"
                                SET
                                    valor = CASE
                                        WHEN "configuracionUID" = $2 THEN $1
                                        WHEN "configuracionUID" = $4 THEN $3
                                        WHEN "configuracionUID" = $6 THEN $5
                                        ELSE valor
                                    END
                                WHERE
                                    "configuracionUID" IN ($2, $4, $6);
                                `;
        const nuevaConfiguracion = [
            diasAntelacionReserva,
            configuracionUID_diasAntelacionReserva,
            limiteFuturoReserva,
            configuracionUID_limiteFuturoReserva,
            diasMaximosReserva,
            configuracionUID_diasMaximosReserva
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
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}