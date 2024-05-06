import { conexion } from "../../../componentes/db.mjs"
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs"

export const listarMisReservas = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        if (IDX.control()) return

        const usuario = entrada.session.usuario
        const paginaActual = validadoresCompartidos.tipos.numero({
            string: entrada.body.pagina,
            nombreCampo: "El numero de página",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna,
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoColumna,
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const paginaActualSQL = Number((paginaActual - 1) + "0");
        const numeroPorPagina = 10;
        // Comprobar si la cuenta tiene un email
        const obtenerDatosUsuario = `
            SELECT 
                email,
                "estadoCorreo"
            FROM 
                "datosDeUsuario" 
            WHERE 
                "usuarioIDX" = $1`;
        const resolverObtenerDatosUsuario = await conexion.query(obtenerDatosUsuario, [usuario]);
        const email = resolverObtenerDatosUsuario.rows[0].email;
        const estadoCorreo = resolverObtenerDatosUsuario.rows[0].estadoCorreo;
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
            const error = "Tienes que verificar tu dirección de correo electronico para poder acceder a la reservas asociadas a tu direcíon de correo electroníco.";
            throw new Error(error);
        }
        const uidClientesArray = [];
        // Buscar el email verificado, en titulares poll y titulares vitini
        const consultaClientes = `
              SELECT 
                  uid
              FROM
                  clientes
              WHERE
                  email = $1`;
        // Ojo por que puede que se deba pasar el numero en number y no en cadena
        const clientesSeleccionados = await conexion.query(consultaClientes, [email]);
        clientesSeleccionados.rows.map((cliente) => {
            uidClientesArray.push(cliente.uid);
        });
        const reservaUIDS_seleccionadas = [];
        const selecionarReservaUIDParaSelecionarReservas = `                       
            SELECT 
                "reservaUID"
            FROM
                "reservaTitulares"
            WHERE
                "titularUID" = ANY($1::int[])`;
        // Ojo por que puede que se deba pasar el numero en number y no en cadena
        const reservasUIDS_porClientes = await conexion.query(selecionarReservaUIDParaSelecionarReservas, [uidClientesArray]);
        for (const reservaUID of reservasUIDS_porClientes.rows) {
            reservaUIDS_seleccionadas.push(reservaUID.reservaUID);
        }
        const consultaClientesPool = `                       
            SELECT 
                reserva
            FROM
                "poolTitularesReserva"
            WHERE
                "emailTitular" = $1`;
        // Ojo por que puede que se deba pasar el numero en number y no en cadena
        const reservasUIDS_porClientes_pool = await conexion.query(consultaClientesPool, [email]);
        for (const reservaUID of reservasUIDS_porClientes_pool.rows) {
            reservaUIDS_seleccionadas.push(reservaUID.reserva);
        }
        const validadores = {
            nombreColumna: async (nombreColumna) => {
                const filtronombreColumna = /^[a-zA-Z]+$/;
                if (!filtronombreColumna.test(nombreColumna)) {
                    const error = "el campo 'nombreColumna' solo puede ser letras minúsculas y mayúsculas.";
                    throw new Error(error);
                }
                const consultaExistenciaNombreColumna = `
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'reservas' AND column_name = $1;
                    `;
                const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
                if (resuelveNombreColumna.rowCount === 0) {
                    const miArray = [
                        'nombreCompleto',
                        'pasaporteTitular',
                        'emailTitular'
                    ];
                    if (!miArray.includes(nombreColumna)) {
                        const error = "No existe el nombre de la columna que quieres ordenar";
                        throw new Error(error);
                    }
                }
            },
            sentidoColumna: (sentidoColumna) => {
                let sentidoColumnaSQL;
                const sentidoColumnaPreVal = sentidoColumna;
                if (sentidoColumnaPreVal !== "descendente" && sentidoColumnaPreVal !== "ascendente") {
                    const error = "El sentido del ordenamiento de la columna es ascendente o descendente";
                    throw new Error(error);
                }
                if (sentidoColumnaPreVal === "ascendente") {
                    sentidoColumnaSQL = "ASC";
                }
                if (sentidoColumnaPreVal === "descendente") {
                    sentidoColumnaSQL = "DESC";
                }
                const estructuraFinal = {
                    sentidoColumna: sentidoColumnaPreVal,
                    sentidoColumnaSQL: sentidoColumnaSQL
                };
                return estructuraFinal;
            }
        };
        let sentidoColumnaSQL;
        if (nombreColumna) {
            await validadores.nombreColumna(nombreColumna);
            sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL;
            sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna;
        }
        let ordenColumnaSQL = "";
        if (nombreColumna) {
            ordenColumnaSQL = `
                    ORDER BY 
                    "${nombreColumna}" ${sentidoColumnaSQL} 
                    `;
        }
        // extraer las reservasa asociadas a esos titulares
        const obtenerDetallesReserva = `
            SELECT 
                    reserva,
                    to_char(entrada, 'DD/MM/YYYY') as entrada,
                    to_char(salida, 'DD/MM/YYYY') as salida,
                    "estadoReserva", 
                    "estadoPago", 
                    to_char(creacion, 'DD/MM/YYYY') as creacion,
                    COUNT(*) OVER() as total_filas
            FROM
                    reservas
            WHERE
                ($1::int[] IS NOT NULL AND reserva = ANY($1::int[])) 
            ${ordenColumnaSQL}
            LIMIT
                $2
            OFFSET
                $3;`;
        // Ojo por que puede que se deba pasar el numero en number y no en cadena
        const datosListaReservas = [
            reservaUIDS_seleccionadas,
            numeroPorPagina,
            paginaActualSQL
        ];
        const resolverObtenerReservas = await conexion.query(obtenerDetallesReserva, datosListaReservas);
        const consultaConteoTotalFilas = resolverObtenerReservas?.rows[0]?.total_filas ? resolverObtenerReservas.rows[0].total_filas : 0;
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        if (resolverObtenerReservas.rowCount === 0) {
            const error = `No hay ninguna reserva realizada y confirmada con la dirección de correo electronico ${email}`;
            throw new Error(error);
        }
        if (resolverObtenerReservas.rowCount > 0) {
            for (const detallesFila of resolverObtenerReservas.rows) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
            const reservasEncontradas = resolverObtenerReservas.rows;
            const ok = {
                ok: "Aqui tienes tus reservas",
                pagina: Number(paginaActual),
                paginasTotales: totalPaginas,
                totalReservas: Number(consultaConteoTotalFilas),
            };
            if (nombreColumna) {
                ok.nombreColumna = nombreColumna;
                ok.sentidoColumna = sentidoColumna;
            }
            ok.reservas = reservasEncontradas;
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}