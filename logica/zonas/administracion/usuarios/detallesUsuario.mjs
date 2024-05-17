import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
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
        const usaurio = await obtenerUsuario(usuarioIDX)
        const rol = usaurio.rolIDV;
        const estadoCuenta = usaurio.estadoCuentaIDV;
        ok.ok.usuarioIDX = usuarioIDX;
        ok.ok.rol = rol;
        ok.ok.estadoCuenta = estadoCuenta;

        const detallesCliente = obtenerDatosPersonales(usuarioIDX)
        if (!detallesCliente.usuario) {
            detallesCliente = resuelveCrearFicha.rows[0];
            const nuevaFicha = await insertarFilaDatosPersonales(usuarioIDX)
            detallesCliente.push(...nuevaFicha)
        }
        for (const [dato, valor] of Object.entries(detallesCliente)) {
            ok.ok[dato] = valor;
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}