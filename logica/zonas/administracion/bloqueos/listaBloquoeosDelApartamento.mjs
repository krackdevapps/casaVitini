import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/sistemaDeBloqueos/eliminarBloqueoCaducado.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";

export const listaBloquoeosDelApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return



        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadena = /^[a-z0-9]+$/;
        if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
            const error = "el campo 'apartmentoIDV' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
            throw new Error(error);
        }
        await eliminarBloqueoCaducado();

        const validarApartmento = `
                                SELECT
                                uid
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;`;
        const resuelveValidarApartamentoIDV = await conexion.query(validarApartmento, [apartamentoIDV]);
        if (resuelveValidarApartamentoIDV.rowCount === 0) {
            const error = "No existe ningún apartamento con el identicados visual apartmentoIDV que has pasado.";
            throw new Error(error);
        }

        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
        const consultaDetallesBloqueoApartamento = `
                                    SELECT
                                    uid,
                                    to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                    to_char(salida, 'DD/MM/YYYY') as salida, 
                                    apartamento,
                                    "tipoBloqueo",
                                    motivo,
                                    zona
                                    FROM "bloqueosApartamentos"
                                    WHERE apartamento = $1;`;
        const resuelveBloqueosPorApartmento = await conexion.query(consultaDetallesBloqueoApartamento, [apartamentoIDV]);
        const ok = {};
        if (resuelveBloqueosPorApartmento.rowCount === 0) {
            ok.apartamentoIDV = apartamentoIDV;
            ok.apartamentoUI = apartamentoUI;
            ok.ok = [];
        }
        if (resuelveBloqueosPorApartmento.rowCount > 0) {
            const bloqueosEncontradosDelApartamento = resuelveBloqueosPorApartmento.rows;
            const bloqueosDelApartamentoEntonctrado = [];
            bloqueosEncontradosDelApartamento.map((bloqueoDelApartamento) => {
                const uidBloqueo = bloqueoDelApartamento.uid;
                const tipoBloqueo = bloqueoDelApartamento.tipoBloqueo;
                const entrada = bloqueoDelApartamento.entrada;
                const salida = bloqueoDelApartamento.salida;
                const motivo = bloqueoDelApartamento.motivo;
                const zona = bloqueoDelApartamento.zona;
                const estructuraBloqueo = {
                    uidBloqueo: uidBloqueo,
                    tipoBloqueo: tipoBloqueo,
                    entrada: entrada,
                    salida: salida,
                    motivo: motivo,
                    zona: zona
                };
                bloqueosDelApartamentoEntonctrado.push(estructuraBloqueo);
            });
            ok.apartamentoIDV = apartamentoIDV;
            ok.apartamentoUI = apartamentoUI;
            ok.ok = bloqueosDelApartamentoEntonctrado;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}