
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const listarApartamentosComoEntidades = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return



        const estructuraApartamentosObjeto = {};
        const consultaApartamento = `
                                SELECT
                                apartamento,
                                "apartamentoUI"
                                FROM apartamentos;`;
        const resuleveConsultaApartamento = await conexion.query(consultaApartamento);
        if (resuleveConsultaApartamento.rowCount === 0) {
            const ok = {
                ok: "No existe ningun apartamento como entidad, por favor crea uno para poder construir una configuracion de alojamiento sobre el",
                "apartamentosComoEntidadesDisponibles": []
            };
            salida.json(ok);
        }
        if (resuleveConsultaApartamento.rowCount > 0) {
            const apartamentoEntidades = resuleveConsultaApartamento.rows;
            apartamentoEntidades.map((detallesApartamento) => {
                const apartamentoIDV = detallesApartamento.apartamento;
                const apartamentoUI = detallesApartamento.apartamentoUI;
                estructuraApartamentosObjeto[apartamentoIDV] = apartamentoUI;
            });
            const apartamentosComoEntidades_formatoArrayString = [];
            apartamentoEntidades.map((detallesDelApartamento) => {
                const apartamentoIDV = detallesDelApartamento.apartamento;
                apartamentosComoEntidades_formatoArrayString.push(apartamentoIDV);
            });
            const consultaConfiguraciones = `
                                    SELECT
                                    "apartamentoIDV"
                                    FROM "configuracionApartamento"
                                    ;`;
            const resuelveConsultaApartamento = await conexion.query(consultaConfiguraciones);
            const apartamentoConfiguraciones = resuelveConsultaApartamento.rows;
            const apartamentosIDVConfiguraciones_formatoArrayString = [];
            apartamentoConfiguraciones.map((detallesapartamento) => {
                const apartamentoIDV = detallesapartamento.apartamentoIDV;
                apartamentosIDVConfiguraciones_formatoArrayString.push(apartamentoIDV);
            });
            const apartamentosDisponiblesParaConfigurar = apartamentosComoEntidades_formatoArrayString.filter(entidad => !apartamentosIDVConfiguraciones_formatoArrayString.includes(entidad));
            const estructuraFinal = [];
            for (const apartamentoDisponible of apartamentosDisponiblesParaConfigurar) {
                if (estructuraApartamentosObjeto[apartamentoDisponible]) {
                    const estructuraFinalObjeto = {
                        apartamentoIDV: apartamentoDisponible,
                        apartamentoUI: estructuraApartamentosObjeto[apartamentoDisponible]
                    };
                    estructuraFinal.push(estructuraFinalObjeto);
                }
            }
            const ok = {
                ok: "Apartamento especificos disponibles",
                apartamentosComoEntidadesDisponibles: estructuraFinal
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}