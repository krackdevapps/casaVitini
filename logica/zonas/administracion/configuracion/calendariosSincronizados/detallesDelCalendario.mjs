import { conexion } from "../../../../componentes/db.mjs";
import { resolverApartamentoUI } from "../../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";


export const detallesDelCalendario = async (entrada, salida) => {
    try {
        const calendarioUID = entrada.body.calendarioUID;
        const filtroNumeros = /^[0-9]+$/;
        if (!calendarioUID || !filtroNumeros.test(calendarioUID)) {
            const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
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
                                    uid = $1
                                    `;
        const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, [calendarioUID]);
        if (resuelveCalendariosSincronizados.rowCount > 0) {
            for (const detallesDelCalendario of resuelveCalendariosSincronizados.rows) {
                const apartamentoIDV = detallesDelCalendario.apartamentoIDV;
                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                detallesDelCalendario.apartamentoUI = apartamentoUI;
            }
            ok.ok = resuelveCalendariosSincronizados.rows[0];
        } else {
            const error = "No existe ningun calendario con ese identificador, revisa el identificador.";
            throw new Error(error);
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}