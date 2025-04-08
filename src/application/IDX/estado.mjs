
import { obtenerUsuario } from "../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { eliminarSessionPorRolPorCaducidad } from "../../infraestructure/repository/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerGruposDelUsuario } from "../../infraestructure/repository/secOps/obtenerGruposDelUsuario.mjs";

export const estado = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 0
        })

        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await eliminarSessionPorRolPorCaducidad();

        
        const usuario = entrada.session?.usuario;
        const respuesta = {};
        if (usuario) {

            const gruposDelUsuario = await obtenerGruposDelUsuario(usuario)
            respuesta.estadoIDV = "conectado";
            respuesta.usuario = usuario;
            respuesta.gruposDelUsuario = gruposDelUsuario;
            respuesta.cuentaVerificadaIDV = "no";
            const cuentaUsuario = await obtenerUsuario({
                usuario,
                errorSi: "noExiste"
            })
            const estadoCuenta = cuentaUsuario.cuentaVerificadaIDV;
            if (estadoCuenta === "si") {
                respuesta.cuentaVerificadaIDV = "si";
            }
        } else {
            respuesta.estadoIDV = "desconectado";
        }
        return respuesta;

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
