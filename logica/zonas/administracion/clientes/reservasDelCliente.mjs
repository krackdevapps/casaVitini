import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerReservasDelClienteComoTitular } from "../../../repositorio/clientes/obtenerReservasDelClienteComoTitular.mjs";
import { obtenerReservasDelClienteComoPernoctante } from "../../../repositorio/clientes/obtenerReservasDelClienteComoPernoctante.mjs";
import { obtenerReservasDelCliente } from "../../../repositorio/clientes/obtenerReservasDelCliente.mjs";

export const reservasDelCliente = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        console.log("test")

        const cliente = validadoresCompartidos.tipos.numero({
            number: entrada.body.cliente,
            nombreCampo: "El identificador universal del cliente (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna || "",
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoSinnEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const sentidoColumna = validadoresCompartidos.tipos.cadena({
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
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        if (nombreColumna !== "como" && nombreColumna !== "") {
            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "reservas"
            })    
            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)
        }

        const comoTitularPreProcesado = [];
        const comoPernoctantePreProcesado = [];
        const reservasUIDComoTitular = await obtenerReservasDelClienteComoTitular(cliente)
        if (reservasUIDComoTitular.length > 0) {
            reservasUIDComoTitular.map((detallesReserva) => {
                const uid = detallesReserva.reservaUID;
                comoTitularPreProcesado.push(uid);
            });
        }
        const reservasUIDComoPernoctante = await obtenerReservasDelClienteComoPernoctante(cliente)
        if (reservasUIDComoPernoctante.length > 0) {
            reservasUIDComoPernoctante.map((detallesReserva) => {
                const reserva = detallesReserva.reserva;
                comoPernoctantePreProcesado.push(reserva);
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
            sentidoColumna:sentidoColumna,
            nombreColumna:nombreColumna
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
        const estructuraFinal = {
            ok: "Reservas del cliente encontradas",
            totalReservas: Number(consultaConteoTotalFilas),
            paginasTotales: totalPaginas,
            pagina: pagina,
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna,
            reservas: reservasClasificadas
        };
        salida.json(estructuraFinal);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}