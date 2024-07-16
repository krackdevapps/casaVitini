import { DateTime } from "luxon";
import { enviarEmailAlCrearCuentaNueva } from "../../sistema/Mail/enviarEmailAlCrearCuentaNueva.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../sistema/VitiniIDX/vitiniCrypto.mjs";

import { obtenerUsuarioPorCodigoVerificacion } from "../../repositorio/usuarios/obtenerUsuarioPorCodigoVerificacion.mjs";
import { insertarUsuario } from "../../repositorio/usuarios/insertarUsuario.mjs";
import { insertarFilaDatosPersonales } from "../../repositorio/usuarios/insertarFilaDatosPersonales.mjs";
import { actualizarDatos } from "../../repositorio/usuarios/actualizarDatos.mjs";
import { eliminarSessionPorRolPorCaducidad } from "../../repositorio/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../repositorio/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { obtenerDatosPersonalesPorMail } from "../../repositorio/usuarios/obtenerDatosPersonalesPorMail.mjs";
import { obtenerUsuario } from "../../repositorio/usuarios/obtenerUsuario.mjs";
import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";

export const crearCuentaDesdeMiCasa = async (entrada, salida) => {
    try {

        const claveNueva = entrada.body.claveNueva;
        const claveConfirmada = entrada.body.claveConfirmada;

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const email = validadoresCompartidos.tipos
            .correoElectronico(entrada.body.email)

        validadoresCompartidos.claves.minimoRequisitos(claveNueva);

        if (!claveConfirmada) {
            const error = "Vuelve a escribir tu contrasena de nuevo";
            throw new Error(error);
        }
        if (claveNueva.trim() !== claveConfirmada) {
            const error = "La contrasenas no coinciden, revisa la contrasenas escritas";
            throw new Error(error);
        }
        if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
            const error = "El nombre de usuario no esta disponbile, escoge otro";
            throw new Error(error);
        }

        if (claveNueva === usuarioIDX) {
            const error = "El nombre de usuario y la contrasena no pueden ser iguales por temas de seguridad.";
            throw new Error(error);
        }

        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await eliminarSessionPorRolPorCaducidad();
        await campoDeTransaccion("iniciar")
        await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"
        })
        usuariosLimite(usuarioIDX)
        await obtenerDatosPersonalesPorMail(email)
        const cryptoData = {
            sentido: "cifrar",
            clavePlana: claveNueva
        };
        const retorno = vitiniCrypto(cryptoData);
        const nuevaSal = retorno.nuevaSal;
        const hashCreado = retorno.hashCreado;
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
            // En este punto, tenemos un código único que no existe en la base de datos
            return codigoGenerado;
        };
        const codigoAleatorioUnico = await controlCodigo();
        const fechaActualUTC = DateTime.utc();
        const fechaCaducidadCuentaNoVerificada = fechaActualUTC.plus({ minutes: 30 });
        const estadoCuenta = "activado";
        const cuentaVerificada = "no";
        const rolIDV = "cliente";

        const nuevoUsuario = await insertarUsuario({
            usuarioIDX: usuarioIDX,
            rolIDV: rolIDV,
            estadoCuenta: estadoCuenta,
            nuevaSal: nuevaSal,
            hashCreado: hashCreado,
            cuentaVerificada: cuentaVerificada,
            fechaCaducidadCuentaNoVerificada: fechaCaducidadCuentaNoVerificada,
        })
        await insertarFilaDatosPersonales(usuarioIDX)
        await actualizarDatos({
            email: email,
            usuario: usuarioIDX
        })
        await campoDeTransaccion("confirmar");
        const datosVerificacion = {
            email: email,
            codigoVerificacion: codigoAleatorioUnico
        };
        enviarEmailAlCrearCuentaNueva(datosVerificacion);
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: nuevoUsuario.usuario
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar");
        throw errorFinal
    }
}