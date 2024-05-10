import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const buscar = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const buscar = validadoresCompartidos.tipos.cadena({
            string: entrada.body.buscar,
            nombreCampo: "El campo buscar esta vacío",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const tipoBusqueda = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBusqueda,
            nombreCampo: "El tipoBusqueda",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
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
        })
        if (tipoBusqueda !== "rapido") {
            tipoBusqueda = null;
        }

        const pagina = validadoresCompartidos.tipos.numero({
            number: entrada.body.pagina || 1,
            nombreCampo: "El numero de página",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        let condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = "";
        let nombreColumnaSentidoUI;
        let nombreColumnaUI;
        if (nombreColumna) {
            const filtronombreColumna = /^[a-zA-Z]+$/;
            if (!filtronombreColumna.test(nombreColumna)) {
                const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas.";
                throw new Error(error);
            }
            const consultaExistenciaNombreColumna = `
                                SELECT column_name
                                FROM information_schema.columns
                                WHERE table_name = 'clientes' AND column_name = $1;
                                `;
            const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
            if (resuelveNombreColumna.rowCount === 0) {
                const error = "No existe el nombre de la columna en la tabla clientes";
                throw new Error(error);
            }
            // OJO con la coma, OJO LA COMA ES IMPORTANTISMA!!!!!!!!
            //!!!!!!!
            if (sentidoColumna !== "descendente" && sentidoColumna !== "ascendente") {
                sentidoColumna = "ascendente";
            }
            if (sentidoColumna == "ascendente") {
                sentidoColumna = "ASC";
                nombreColumnaSentidoUI = "ascendente";
            }
            if (sentidoColumna == "descendente") {
                sentidoColumna = "DESC";
                nombreColumnaSentidoUI = "descendente";
            }
            // nombreColumnaUI = nombreColumna.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
            condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = `,"${nombreColumna}" ${sentidoColumna}`;
        }
        const terminoBuscar = buscar.split(" ");
        const terminosFormateados = [];
        terminoBuscar.map((termino) => {
            const terminoFinal = "%" + termino + "%";
            terminosFormateados.push(terminoFinal);
        });
        const numeroPorPagina = 10;
        const numeroPagina = Number((pagina - 1) + "0");
        const consultaConstructor = `    
                                SELECT *,
                                COUNT(*) OVER() as "totalClientes"
                            FROM clientes
                            WHERE  
                                (
                                LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("email", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("telefono", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
                                )
                            ORDER BY
                                (
                                  CASE
                                    WHEN (
                                      (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                    ) = 1 THEN 1
                                    WHEN (
                                      (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                    ) = 3 THEN 3
                                    ELSE 2
                                  END
                                ) 
                                ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                            LIMIT $2 OFFSET $3;`;
        const resuelveConsultaReservas = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina]);
        const consultaReservas = resuelveConsultaReservas.rows;
        const consultaConteoTotalFilas = consultaReservas[0]?.totalClientes ? consultaReservas[0].totalClientes : 0;
        if (tipoBusqueda === "rapido") {
            consultaReservas.map((cliente) => {
                delete cliente.Telefono;
                delete cliente.email;
                delete cliente.notas;
            });
        }
        consultaReservas.map((cliente) => {
            delete cliente.totalClientes;
        });
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");
        const respuesta = {
            buscar: buscar,
            totalClientes: consultaConteoTotalFilas,
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina) + 1,
        };
        if (nombreColumna) {
            respuesta.nombreColumna = nombreColumna;
            respuesta.sentidoColumna = nombreColumnaSentidoUI;
        }
        respuesta.clientes = consultaReservas;
        salida.json(respuesta);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}