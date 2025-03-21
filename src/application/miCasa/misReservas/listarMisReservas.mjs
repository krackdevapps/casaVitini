import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerClientesPorMail } from "../../../infraestructure/repository/clientes/obtenerClientesPorMail.mjs";
import { obtenerTitularReservaPorClienteUID_array } from "../../../infraestructure/repository/reservas/titulares/obtenerTitularReservaPorClienteUID.mjs";
import { obtenerTitularReservaPoolPorMail } from "../../../infraestructure/repository/reservas/titulares/obtenerTitularReservaPoolPorMail.mjs";
import { obtenerReservasComoLista } from "../../../infraestructure/repository/miCasa/reservas/obtenerReservasComoLista.mjs";
import { obtenerDatosPersonales } from "../../../infraestructure/repository/usuarios/obtenerDatosPersonales.mjs";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import Joi from "joi";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";

export const listarMisReservas = async (entrada) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.control()
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const usuario = entrada.session.usuario
        const esquemaBusqueda = Joi.object({
            pagina: Joi.number(),
            nombreColumna: Joi.string(),
            sentidoColumna: Joi.string()
        }).required().messages(commonMessages)

        controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })

        const paginaActual = validadoresCompartidos.tipos.granEntero({
            number: entrada.body.pagina,
            nombreCampo: "El numero de página",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        let nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna || "",
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        if (nombreColumna === "reserva") {
            nombreColumna = "reservaUID"
        } else if (nombreColumna === "estadoPago") {
            nombreColumna = "estadoPagoIDV"
        } else if (nombreColumna === "estadoReserva") {
            nombreColumna = "estadoReservaIDV"
        }

        const sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoColumna || "",
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        if (nombreColumna) {
            const nombreColumnaVirtual = [
                'nombreCompleto',
                'pasaporteTitular',
                'mailTitular'
            ]
            if (nombreColumnaVirtual.includes(nombreColumna)) {
                const error = "No existe el nombre de la columna que quieres ordenar";
                throw new Error(error);
            } else {
                await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                    nombreColumna: nombreColumna,
                    tabla: "reservas"
                })
            }
            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)
        }


        const paginaActualSQL = Number((paginaActual - 1) + "0");
        const numeroPorPagina = 10;

        const datosDelUsuario = await obtenerDatosPersonales(usuario)
        const usuarioMail = datosDelUsuario.mail;
        if (!usuarioMail) {
            const error = "Se necesita que definas tu dirección de correo electrónico en mis datos dentro de tu cuenta. Las reservas se asocian a tu cuenta mediante la dirección de correo electrónico que usaste para confirmar la reserva. Es decir, debes de ir a Mis datos dentro de tu cuenta, escribir tu dirección de correo electrónico y confirmarlo con el correo de confirmación que te enviaremos. Una vez hecho eso, podrás ver tus reservas.";
            throw new Error(error);
        }


        const cuentaUsuario = await obtenerUsuario({
            usuario,
            errorSi: "noExiste"
        })
        const estadoCuentaVerificada = cuentaUsuario.cuentaVerificadaIDV;

        if (estadoCuentaVerificada !== "si") {
            const error = "Tienes que verificar tu dirección de correo electrónico para poder acceder a las reservas asociadas a tu dirección de correo electrónico.";
            throw new Error(error);
        }
        const reservasUIDArray = []

        const clientesPorMail = await obtenerClientesPorMail({
            mail: usuarioMail,
            errorSi: "desactivado"
        })
        if (clientesPorMail.length > 0) {
            const clientesUID = clientesPorMail.map((cliente) => {
                return cliente.clienteUID
            });
            const titulares = await obtenerTitularReservaPorClienteUID_array(clientesUID)
            titulares.forEach((detallesTitular) => {
                reservasUIDArray.push(detallesTitular.reservaUID)
            })
        }
        const titularesPool = await obtenerTitularReservaPoolPorMail(usuarioMail)

        if (titularesPool.length > 0) {
            titularesPool.forEach((titularPool) => {
                reservasUIDArray.push(titularPool.reservaUID);
            })
        }

        const listaReservas = await obtenerReservasComoLista({
            reservasUIDArray: reservasUIDArray,
            numeroPorPagina: numeroPorPagina,
            paginaActualSQL: paginaActualSQL,
            sentidoColumna: sentidoColumna,
            nombreColumna: nombreColumna

        })
        const consultaConteoTotalFilas = listaReservas[0]?.total_filas ? listaReservas[0].total_filas : 0;
        if (listaReservas.length === 0) {
            const error = `No hay ninguna reserva realizada y confirmada con la dirección de correo electrónico  ${usuarioMail}`;
            throw new Error(error);
        }
        for (const detallesFila of listaReservas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const ok = {
            ok: "Aquí tienes tus reservas.",
            pagina: Number(paginaActual),
            paginasTotales: totalPaginas,
            totalReservas: Number(consultaConteoTotalFilas),
        };
        if (nombreColumna) {
            if (nombreColumna === "reservaUID") {
                nombreColumna = "reserva"
            } else if (nombreColumna === "estadoPagoIDV") {
                nombreColumna = "estadoPago"
            } else if (nombreColumna === "estadoReservaIDV") {
                nombreColumna = "estadoReserva"
            }


            ok.nombreColumna = nombreColumna;
            ok.sentidoColumna = sentidoColumna;
        }
        ok.reservas = listaReservas;
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }
}