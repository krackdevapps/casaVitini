
import { obtenerTodasLasConfiguracionDeLosApartamento } from "../../../../repositorio/arquitectura/configuraciones/obtenerTodasLasConfiguracionDeLosApartamento.mjs";
import { obtenerTodasLosApartamentos } from "../../../../repositorio/arquitectura/entidades/apartamento/obtenerTodasLosApartamentos.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";


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
                ok: "No existe ningún apartamento como entidad, por favor crea uno para poder construir una configuración de alojamiento sobre él.",
                "apartamentosComoEntidadesDisponibles": []
            };
            return ok
        } else {
            const apartamentoEntidades = todosLosApartamentosComoEntidad;
            apartamentoEntidades.forEach((detallesApartamento) => {
                const apartamentoIDV = detallesApartamento.apartamentoIDV;
                const apartamentoUI = detallesApartamento.apartamentoUI;
                estructuraApartamentosObjeto[apartamentoIDV] = apartamentoUI;
            });
            const apartamentosComoEntidades_formatoArrayString = [];
            apartamentoEntidades.forEach((detallesDelApartamento) => {
                const apartamentoIDV = detallesDelApartamento.apartamentoIDV;
                apartamentosComoEntidades_formatoArrayString.push(apartamentoIDV);
            });

            const configuracionesDeLosApartametnos = await obtenerTodasLasConfiguracionDeLosApartamento()

            const apartamentosIDVConfiguraciones_formatoArrayString = [];
            configuracionesDeLosApartametnos.forEach((detallesapartamento) => {
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
                ok: "Apartamentos específicos disponibles.",
                apartamentosComoEntidadesDisponibles: estructuraFinal
            };
            return ok
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}