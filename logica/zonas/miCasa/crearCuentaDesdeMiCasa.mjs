import { DateTime } from "luxon";
import { conexion } from "../../componentes/db.mjs";
import { borrarCuentasCaducadas } from "../../sistema/VitiniIDX/borrarCuentasCaducadas.mjs";
import { eliminarCuentasNoVerificadas } from "../../sistema/VitiniIDX/eliminarCuentasNoVerificadas.mjs";
import { enviarEmailAlCrearCuentaNueva } from "../../sistema/Mail/enviarEmailAlCrearCuentaNueva.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";
import { vitiniCrypto } from "../../sistema/VitiniIDX/vitiniCrypto.mjs";
import { validarIDXUnico } from "../../sistema/VitiniIDX/validarIDXUnico.mjs";
import { validarEMailUnico } from "../../sistema/VitiniIDX/validarEmailUnico.mjs";
import { filtroError } from "../../sistema/error/filtroError.mjs";

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

        await eliminarCuentasNoVerificadas();
        await borrarCuentasCaducadas();
        await conexion.query('BEGIN'); // Inicio de la transacción
        await validarIDXUnico(usuarioIDX)
        await validarEMailUnico(email)
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
            const validarCodigoAleatorio = `
                SELECT
                "codigoVerificacion"
                FROM usuarios
                WHERE "codigoVerificacion" = $1;`;
            const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio]);
            if (resuelveValidarCodigoAleatorio.rowCount === 1) {
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
        const rol = "cliente";
        const crearNuevoUsuario = `
                INSERT INTO usuarios
                (
                usuario,
                rol,
                "estadoCuenta",
                "cuentaVerificada",
                "codigoVerificacion",
                "fechaCaducidadCuentaNoVerificada",
                sal,
                clave
                )
                VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING
                usuario
                `;
        const datosNuevoUsuario = [
            usuarioIDX,
            rol,
            estadoCuenta,
            cuentaVerificada,
            codigoAleatorioUnico,
            fechaCaducidadCuentaNoVerificada,
            nuevaSal,
            hashCreado
        ];
        const resuelveCrearNuevoUsuario = await conexion.query(crearNuevoUsuario, datosNuevoUsuario);
        if (resuelveCrearNuevoUsuario.rowCount === 0) {
            const error = "No se ha insertado el nuevo usuario en la base de datos";
            throw new Error(error);
        }
        const crearNuevosDatosUsuario = `
                INSERT INTO "datosDeUsuario"
                (
                "usuarioIDX",
                email
                )
                VALUES 
                ($1, $2)
                `;
        const resuelveCrearNuevosDatosUsuario = await conexion.query(crearNuevosDatosUsuario, [usuarioIDX, email]);
        if (resuelveCrearNuevosDatosUsuario.rowCount === 0) {
            const error = "No se ha insertado los datos del nuevo usuario";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha creado el nuevo usuario",
            usuarioIDX: resuelveCrearNuevoUsuario.rows[0].usuario
        };
        salida.json(ok);
        await conexion.query('COMMIT');
        const datosVerificacion = {
            email: email,
            codigoVerificacion: codigoAleatorioUnico
        };
        enviarEmailAlCrearCuentaNueva(datosVerificacion);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}