import { eliminarSessionPorRolPorCaducidad } from "../../infraestructure/repository/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";


export const desconectar = async (entrada, salida) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 0
        })
        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await eliminarSessionPorRolPorCaducidad();
        entrada.session.destroy();
        salida.clearCookie("VitiniID");
        const respuesta = {
            estadoIDV: "desconectado"
        };
        return respuesta


    } catch (errorCapturado) {
        throw errorCapturado
    }
}
