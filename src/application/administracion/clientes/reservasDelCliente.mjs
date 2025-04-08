
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservasDelClienteComoTitular } from "../../../infraestructure/repository/clientes/obtenerReservasDelClienteComoTitular.mjs";
import { obtenerReservasDelClienteComoPernoctante } from "../../../infraestructure/repository/clientes/obtenerReservasDelClienteComoPernoctante.mjs";
import { obtenerReservasDelCliente } from "../../../infraestructure/repository/clientes/obtenerReservasDelCliente.mjs";
import Joi from "joi";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";

export const reservasDelCliente = async (entrada) => {
    try {


        const esquemaBusqueda = Joi.object({
            clienteUID: Joi.string(),
            pagina: Joi.number(),
            nombreColumna: Joi.string(),
            sentidoColumna: Joi.string()
        }).required()

        controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })

        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        let nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna || "",
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoSinEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        let sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoColumna || "",
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoSinEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const pagina = validadoresCompartidos.tipos.numero({
            number: entrada.body.pagina,
            nombreCampo: "El numero de página",
            sePermiteVacio: "no",
            filtro: "numeroSimple",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })


        if (nombreColumna !== "como" && nombreColumna) {
            if (nombreColumna === "reserva") {
                nombreColumna = "reservaUID"
            }

            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "reservas"
            })
            if (!sentidoColumna) {
                sentidoColumna = "ascendente"
            }
            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)
        }

        const comoTitularPreProcesado = [];
        const comoPernoctantePreProcesado = [];
        const reservasUIDComoTitular = await obtenerReservasDelClienteComoTitular(clienteUID)
        if (reservasUIDComoTitular.length > 0) {
            reservasUIDComoTitular.forEach((detallesReserva) => {
                const reservaUID = detallesReserva.reservaUID;
                comoTitularPreProcesado.push(reservaUID);
            });
        }
        const reservasUIDComoPernoctante = await obtenerReservasDelClienteComoPernoctante(clienteUID)
        if (reservasUIDComoPernoctante.length > 0) {
            reservasUIDComoPernoctante.forEach((detallesReserva) => {
                const reservaUID = detallesReserva.reservaUID;
                comoPernoctantePreProcesado.push(reservaUID);
            });
        }

        const encontrarRepetidosEliminar = (comoTitular, comoPernoctante) => {
            const set1 = new Set(comoTitular);
            const set2 = new Set(comoPernoctante);
            const comoAmbos = [...set1].filter((elemento) => set2.has(elemento));
            comoTitular = comoTitular.filter((elemento) => !comoAmbos.includes(elemento));
            comoPernoctante = comoPernoctante.filter((elemento) => !comoAmbos.includes(elemento));
            const estructuraFinal = {
                comoTitular: comoTitular,
                comoPernoctante: comoPernoctante,
                comoAmbos: comoAmbos,
            };
            return estructuraFinal;
        };

        const reservasEstructuradas = encontrarRepetidosEliminar(comoTitularPreProcesado, comoPernoctantePreProcesado);
        const UIDSreservasComoTitular = reservasEstructuradas.comoTitular;
        const UIDSreservasComoPernoctante = reservasEstructuradas.comoPernoctante;
        const UIDSreservasComoAmbos = reservasEstructuradas.comoAmbos;
        const reservasClasificadas = [];
        const numeroPorPagina = 10;

        const dataObtenerReservasDelCliente = {
            UIDSreservasComoTitular: UIDSreservasComoTitular,
            UIDSreservasComoPernoctante: UIDSreservasComoPernoctante,
            UIDSreservasComoAmbos: UIDSreservasComoAmbos,
            numeroPorPagina: numeroPorPagina,
            numeroPagina: pagina,
            sentidoColumna: sentidoColumna,
            nombreColumna: nombreColumna
        }

        const reservasDelClietne = await obtenerReservasDelCliente(dataObtenerReservasDelCliente)
        if (reservasDelClietne.length > 0) {
            reservasClasificadas.push(...reservasDelClietne);
        }
        const consultaConteoTotalFilas = reservasDelClietne[0]?.total_filas ? reservasDelClietne[0].total_filas : 0;
        for (const detallesFila of reservasClasificadas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);

        if (nombreColumna === "reservaUID") {
            nombreColumna = "reserva"
        }

        const estructuraFinal = {
            ok: "Reservas del cliente encontradas",
            totalReservas: Number(consultaConteoTotalFilas),
            paginasTotales: totalPaginas,
            pagina: pagina,
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna,
            reservas: reservasClasificadas
        };
        return estructuraFinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}