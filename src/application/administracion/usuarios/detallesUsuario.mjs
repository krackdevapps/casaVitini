import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { obtenerDatosPersonales } from "../../../infraestructure/repository/usuarios/obtenerDatosPersonales.mjs";
import { insertarFilaDatosPersonales } from "../../../infraestructure/repository/usuarios/insertarFilaDatosPersonales.mjs";

export const detallesUsuario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
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

        const ok = {
            ok: {}
        };
        const usaurio = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })
        const rol = usaurio.rolIDV;
        const estadoCuenta = usaurio.estadoCuentaIDV;
        ok.ok.usuarioIDX = usuarioIDX;
        ok.ok.rol = rol;
        ok.ok.estadoCuenta = estadoCuenta;
        ok.ok.datosUsuario = []
        const datosUsuario = await obtenerDatosPersonales(usuarioIDX)

        if (!datosUsuario?.usuario) {
            const nuevaFicha = await insertarFilaDatosPersonales(usuarioIDX)
            ok.ok.datosUsuario = nuevaFicha
        } else {
            delete datosUsuario.usuario
            ok.ok.datosUsuario = datosUsuario
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}