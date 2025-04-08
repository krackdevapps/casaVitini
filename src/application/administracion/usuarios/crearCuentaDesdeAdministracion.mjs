
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../../shared/VitiniIDX/vitiniCrypto.mjs";
import { insertarUsuario } from "../../../infraestructure/repository/usuarios/insertarUsuario.mjs";
import { insertarFilaDatosPersonales } from "../../../infraestructure/repository/usuarios/insertarFilaDatosPersonales.mjs";
import { Mutex } from "async-mutex";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { usuariosLimite } from "../../../shared/usuarios/usuariosLimite.mjs";
import { obtenerUsuarioPorCodigoVerificacion } from "../../../infraestructure/repository/usuarios/obtenerUsuarioPorCodigoVerificacion.mjs";
import { validadorIDX } from "../../../shared/VitiniIDX/validadorIDX.mjs";

export const crearCuentaDesdeAdministracion = async (entrada, salida) => {
    const mutex = new Mutex()
    try {


        mutex.acquire()
        await campoDeTransaccion("iniciar")

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const clave = entrada.body.clave;
        validadoresCompartidos.claves.minimoRequisitos(clave);
        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
 
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            validadoresCompartidos.tipos.cadena({
                string: testingVI,
                nombreCampo: "El campo testingVI",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
        }
        await validadorIDX(usuarioIDX)
        await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "existe"
        })
        usuariosLimite(usuarioIDX)

        await eliminarUsuarioPorRolPorEstadoVerificacion();
        const estadoCuenta = "desactivado";
        await campoDeTransaccion("iniciar")
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: clave
        };
        const generarCadenaAleatoria = (longitud) => {
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };
        const validarCodigo = async (codigoAleatorio) => {
            const codigoVerificacion = await obtenerUsuarioPorCodigoVerificacion(codigoAleatorio)
            if (codigoVerificacion.length > 0) {
                return true;
            }
        };
        const controlCodigo = async () => {
            const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
            let codigoGenerado;
            let codigoExiste;
            do {
                codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                codigoExiste = await validarCodigo(codigoGenerado);
            } while (codigoExiste);

            return codigoGenerado;
        };


        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
        const cuentaVerificada = "no";
        const codigoAleatorioUnico = await controlCodigo();

        const nuevoUsuario = await insertarUsuario({
            usuarioIDX: usuarioIDX,
            estadoCuenta: estadoCuenta,
            nuevaSal: nuevaSal,
            hashCreado: hashCreado,
            cuentaVerificada: cuentaVerificada,
            codigoAleatorioUnico: codigoAleatorioUnico,
            testingVI: testingVI
        })
        await insertarFilaDatosPersonales(usuarioIDX)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: nuevoUsuario.usuario
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}