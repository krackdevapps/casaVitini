
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../../repositorio/arquitectura/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerTodasLosApartamentos } from "../../../../repositorio/arquitectura/obtenerTodasLosApartamentos.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";

export const listarApartamentosComoEntidades = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const estructuraApartamentosObjeto = {};
        const todosLosApartamentosComoEntidad = await obtenerTodasLosApartamentos()

        if (todosLosApartamentosComoEntidad.length === 0) {
            const ok = {
                ok: "No existe ningun apartamento como entidad, por favor crea uno para poder construir una configuracion de alojamiento sobre el",
                "apartamentosComoEntidadesDisponibles": []
            };
            salida.json(ok);
        } else {
            const apartamentoEntidades = todosLosApartamentosComoEntidad;
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

            const configuracionesDeLosApartametnos = await obtenerTodasLasConfiguracionDeLosApartamento()

            const apartamentosIDVConfiguraciones_formatoArrayString = [];
            configuracionesDeLosApartametnos.map((detallesapartamento) => {
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
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}