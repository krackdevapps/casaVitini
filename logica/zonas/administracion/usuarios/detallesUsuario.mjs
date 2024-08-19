import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerUsuario } from "../../../repositorio/usuarios/obtenerUsuario.mjs";
import { obtenerDatosPersonales } from "../../../repositorio/usuarios/obtenerDatosPersonales.mjs";
import { insertarFilaDatosPersonales } from "../../../repositorio/usuarios/insertarFilaDatosPersonales.mjs";

export const detallesUsuario = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

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