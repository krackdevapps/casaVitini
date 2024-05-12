import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { detallesReserva as detallesReserva_ } from "../../../sistema/reservas/detallesReserva.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const detallesReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const usuario = entrada.session.usuario;
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const obtenerDatosUsuario = `
            SELECT 
                email,
                "estadoCorreo"
            FROM 
                "datosDeUsuario" 
            WHERE 
                "usuarioIDX" = $1`;
        const resolverObteDatosUsuario = await conexion.query(obtenerDatosUsuario, [usuario]);
        const email = resolverObteDatosUsuario.rows[0].email;
        if (!email) {
            const error = "Se necesita que definas tu dirección de correo elecroníco en Mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo eletroníco que usastes para confirmar la reserva. Es decir debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de correo electronico y confirmarlo con el correo de confirmacion que te enviaremos. Una vez hecho eso podras ver tus reservas";
            throw new Error(error);
        }
        // Comporbar si el email esta verificado
        const comprobarMailVerificado = `
            SELECT 
                "cuentaVerificada"
            FROM 
                usuarios 
            WHERE 
                usuario = $1`;
        const resolverMailVerificado = await conexion.query(comprobarMailVerificado, [IDX]);
        const estadoCuentaVerificada = resolverMailVerificado.rows[0].cuentaVerificada;
        if (estadoCuentaVerificada !== "si") {
            const error = "Tienes que verificar tu dirección de correo electronico para poder acceder a las reservas asociadas a tu direcíon de correo electroníco. Para ello pulsa en verificar tu correo electronico.";
            throw new Error(error);
        }
        const validarExistenciaReserva = `
            SELECT
                reserva,
                entrada,
                salida,
                "estadoReserva",
                "estadoPago",
                origen,
                creacion
            FROM 
                reservas
            WHERE
                reserva = $1`;
        const resuelveValidarExistenciaReserva = await conexion.query(validarExistenciaReserva, [reservaUID]);
        if (resuelveValidarExistenciaReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        // La reserva existe asi que se busca si tiene un titular con esa direcion de correo electronico
        let controlAcceso = "no";
        const consultaTitularPool = `
                    SELECT
                        "emailTitular"
                    FROM 
                        "poolTitularesReserva"
                    WHERE
                        reserva = $1
                        AND
                        "emailTitular" = $2
                        `;
        const controlAccesoTitularPool = await conexion.query(consultaTitularPool, [reservaUID, email]);
        if (controlAccesoTitularPool.rowCount === 1) {
            controlAcceso = "si";
        }
        const consultaEnlace = `
            SELECT
                "titularUID"
            FROM 
                "reservaTitulares"
            WHERE
                "reservaUID" = $1`;
        const resuelveEnlaceTitular = await conexion.query(consultaEnlace, [reservaUID]);
        if (resuelveEnlaceTitular.rowCount === 1) {
            const titularUID = resuelveEnlaceTitular.rows[0].titularUID;
            const consultaTitular = `
                SELECT
                    email
                FROM 
                    clientes
                WHERE
                    uid = $1`;
            const resuelveTitular = await conexion.query(consultaTitular, [titularUID]);
            const mailTitular = resuelveTitular.rows[0].email;
            if (mailTitular === email) {
                controlAcceso = "si";
            }
        }
        if (controlAcceso === "no") {
            const error = "No tienes acceso a esta reserva";
            throw new Error(error);
        }
        if (controlAcceso === "si") {
            const metadatos = {
                reservaUID: reservaUID,
                // solo: solo
            };
            const resuelveDetallesReserva = await detallesReserva_(metadatos);
            delete resuelveDetallesReserva.reserva.origen;
            salida.json(resuelveDetallesReserva);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}