import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { controlRol } from "../../../shared/usuarios/controlRol.mjs";

export const datosCuentaIDX = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await controlRol({
            usuarioOperacion: IDX.vitiniIDX(),
            usuarioDestino: usuarioIDX
        })
        const usuario = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })
        const detallesCliente = {
            usuario: usuario.usuario,
            rol: usuario.rolIDV,
            estadoCuenta: usuario.estadoCuentaIDV
        }
        const ok = {
            ok: detallesCliente
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}