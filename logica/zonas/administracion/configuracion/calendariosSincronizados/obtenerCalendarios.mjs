import { conexion } from "../../../../componentes/db.mjs";
import { resolverApartamentoUI } from "../../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";

export const obtenerCalendarios = async (entrada, salida) => {
    try {
        const plataformaCalendarios = entrada.body.plataformaCalendarios;
        const filtroCadena = /^[a-z0-9]+$/;
        if (!plataformaCalendarios || !filtroCadena.test(plataformaCalendarios)) {
            const error = "Hay que definir la plataformaCalendarios, solo se admiten minusculas y numeros sin espacios.";
            throw new Error(error);
        }
        const ok = {
            ok: []
        };
        const consultaConfiguracion = `
                                    SELECT 
                                    uid,
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "uidPublico"
                                    FROM 
                                    "calendariosSincronizados"
                                    WHERE
                                    "plataformaOrigen" = $1
                                    `;
        const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [plataformaCalendarios]);
        if (resuelveCalendariosSincronizados.rowCount > 0) {
            for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                detallesDelCalendario.apartamentoUI = apartamentoUI;
            }
            ok.ok = resuelveCalendariosSincronizados.rows;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}