import { DateTime } from "luxon";
import { enviarMailAlCrearCuentaNueva } from "../../shared/mail/enviarMailAlCrearCuentaNueva.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../shared/VitiniIDX/vitiniCrypto.mjs";
import { obtenerUsuarioPorCodigoVerificacion } from "../../infraestructure/repository/usuarios/obtenerUsuarioPorCodigoVerificacion.mjs";
import { insertarUsuario } from "../../infraestructure/repository/usuarios/insertarUsuario.mjs";
import { insertarFilaDatosPersonales } from "../../infraestructure/repository/usuarios/insertarFilaDatosPersonales.mjs";
import { actualizarDatos } from "../../infraestructure/repository/usuarios/actualizarDatos.mjs";
import { eliminarSessionPorRolPorCaducidad } from "../../infraestructure/repository/sessiones/eliminarSessionPorRolPorCaducidad.mjs";
import { eliminarUsuarioPorRolPorEstadoVerificacion } from "../../infraestructure/repository/usuarios/eliminarUsuarioPorRolPorEstadoVerificacion.mjs";
import { obtenerDatosPersonalesPorMail } from "../../infraestructure/repository/usuarios/obtenerDatosPersonalesPorMail.mjs";
import { obtenerUsuario } from "../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { campoDeTransaccion } from "../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { usuariosLimite } from "../../shared/usuarios/usuariosLimite.mjs";
import { validadorIDX } from "../../shared/VitiniIDX/validadorIDX.mjs";

export const crearCuentaDesdeMiCasa = async (entrada, salida) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })

        const claveNueva = entrada.body.claveNueva;
        const claveConfirmada = entrada.body.claveConfirmada;

        const usuarioIDX = validadoresCompartidos.tipos.cadena({
            string: entrada.body.usuarioIDX,
            nombreCampo: "El nombre de usuario",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        await validadorIDX(usuarioIDX)
        const mail = validadoresCompartidos.tipos
            .correoElectronico({
                mail: entrada.body.mail,
                nombreCampo: "El campo del mail",
                sePermiteVacio: "no"
            })

        validadoresCompartidos.claves.minimoRequisitos(claveNueva);

        if (!claveConfirmada) {
            const error = "Vuelve a escribir tu contraseña de nuevo.";
            throw new Error(error);
        }
        if (claveNueva.trim() !== claveConfirmada) {
            const error = "Las contraseñas no coinciden, revisa las contraseñas escritas.";
            throw new Error(error);
        }
        if (usuarioIDX === "crear" || usuarioIDX === "buscador") {
            const error = "El nombre de usuario no está disponible, escoge otro.";
            throw new Error(error);
        }

        if (claveNueva === usuarioIDX) {
            const error = "El nombre de usuario y la contraseña no pueden ser iguales por temas de seguridad.";
            throw new Error(error);
        }

        await eliminarUsuarioPorRolPorEstadoVerificacion();
        await eliminarSessionPorRolPorCaducidad();
        await campoDeTransaccion("iniciar")
        await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "existe"
        })
        usuariosLimite(usuarioIDX)
        await obtenerDatosPersonalesPorMail(mail)
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

            return codigoGenerado;
        };
        const codigoAleatorioUnico = await controlCodigo();
        const fechaActualUTC = DateTime.utc();
        const fechaCaducidadCuentaNoVerificada = fechaActualUTC.plus({ minutes: 30 });
        const estadoCuenta = "activado";
        const cuentaVerificada = "no";

        const nuevoUsuario = await insertarUsuario({
            usuarioIDX: usuarioIDX,
            estadoCuenta: estadoCuenta,
            nuevaSal: nuevaSal,
            hashCreado: hashCreado,
            cuentaVerificada: cuentaVerificada,
            codigoAleatorioUnico: codigoAleatorioUnico,
            fechaCaducidadCuentaNoVerificada: fechaCaducidadCuentaNoVerificada,
        })
        await insertarFilaDatosPersonales(usuarioIDX)
        await actualizarDatos({
            mail: mail,
            usuario: usuarioIDX
        })
        await campoDeTransaccion("confirmar");
        const datosVerificacion = {
            mail: mail,
            codigoVerificacion: codigoAleatorioUnico
        };
        enviarMailAlCrearCuentaNueva(datosVerificacion);
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: nuevoUsuario.usuario
        }
        return ok
    } catch (errorCapturado) {

        await campoDeTransaccion("cancelar");
        throw errorCapturado
    }
}