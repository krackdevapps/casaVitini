import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";

export const buscarUsuarios = async (entrada, salida) => {
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
                                    WHERE table_name = 'datosDeUsuario' AND column_name = $1;
                                    `;
            const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
            if (resuelveNombreColumna.rowCount === 0) {
                const error = "No existe el nombre de la columna que quieres ordenar";
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
            nombreColumnaUI = nombreColumna;
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
                                SELECT "usuarioIDX", email, nombre, "primerApellido", "segundoApellido", pasaporte, telefono,
                                COUNT(*) OVER() as "totalUsuarios"
                                FROM "datosDeUsuario"
                                WHERE  
                                (
    
                                LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE(email, '')) ILIKE ANY($1) OR
                                LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1) OR
                                LOWER(COALESCE(telefono, '')) ILIKE ANY($1) OR
    
    
                                LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
                                )
                                ORDER BY
                                (
                                  CASE
                                    WHEN (
    
                                      (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
    
                                      (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                    ) = 1 THEN 1
                                    WHEN (
    
    
                                      (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
    
                                      (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                    ) = 3 THEN 3
                                    ELSE 2
                                  END
                                ) DESC
                                ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                            LIMIT $2 OFFSET $3;`;
        const consultaUsuarios = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina]);
        const usuariosEncontrados = consultaUsuarios.rows;
        const consultaConteoTotalFilas = usuariosEncontrados[0]?.totalUsuarios ? usuariosEncontrados[0].totalUsuarios : 0;
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");
        const Respuesta = {
            buscar: buscar,
            totalUsuarios: consultaConteoTotalFilas,
            nombreColumna: nombreColumna,
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina) + 1,
        };
        if (nombreColumna) {
            Respuesta.nombreColumna;
            Respuesta.sentidoColumna = nombreColumnaSentidoUI;
        }
        usuariosEncontrados.map((detallesUsuario) => {
            delete detallesUsuario.totalUsuarios;
        });
        Respuesta.usuarios = usuariosEncontrados;
        salida.json(Respuesta);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
    }
}