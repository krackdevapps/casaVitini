import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { evitarDuplicados } from "../../../sistema/precios/comportamientoPrecios/evitarDuplicados.mjs";
import { resolverApartamentoUI } from "../../../sistema/resolucion/resolverApartamentoUI.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";


export const crearComportamiento = async (entrada, salida) => {
    let mutex;
    try {
        await mutex.acquire();
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        mutex = new Mutex()
        await mutex.acquire();
        const nombreComportamiento = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreComportamiento,
            nombreCampo: "El campo del nombreComportamiento",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentos",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })

        const filtroCantidad = /^\d+\.\d{2}$/;
        const filtroCadenaSinEspacui = /^[a-z0-9]+$/;

        const tipo = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipo,
            nombreCampo: "El tipo",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (tipo !== "porDias" && tipo !== "porRango") {
            const error = "Por favor determine si el tipo de bloqueo es porRango o porDias.";
            throw new Error(error);
        }
        let fechaInicio_ISO;
        let fechaFinal_ISO;
        let diasArray;

        await conexion.query('BEGIN'); // Inicio de la transacción
        if (tipo === "porRango") {
            const fechaInicio = entrada.body.fechaInicio;
            const fechaFinal = entrada.body.fechaFinal;

            const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
            if (!filtroFecha.test(fechaInicio)) {
                const error = "el formato fecha de inicio no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                throw new Error(error);
            }
            if (!filtroFecha.test(fechaFinal)) {
                const error = "el formato fecha de fin no esta correctametne formateado debe ser una cadena asi 00/00/0000";
                throw new Error(error);
            }
            const fechaInicioArreglo = fechaInicio.split("/");
            const diaEntrada = fechaInicioArreglo[0];
            const mesEntrada = fechaInicioArreglo[1];
            const anoEntrada = fechaInicioArreglo[2];
            const fechaFinArreglo = fechaFin.split("/");
            const diaSalida = fechaFinArreglo[0];
            const mesSalida = fechaFinArreglo[1];
            const anoSalida = fechaFinArreglo[2];
            fechaInicio_ISO = `${anoEntrada}-${mesEntrada}-${diaEntrada}`;
            fechaFinal_ISO = `${anoSalida}-${mesSalida}-${diaSalida}`;
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaInicio_ISO);
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaFinal_ISO);


            const fechaInicio_Objeto = new Date(fechaInicio_ISO); // El formato es día/mes/ano
            const fechaFinal_Objeto = new Date(fechaFinal_ISO);
            // validacion: la fecha de entrada no puede ser superior a la fecha de salida y al mimso tiempo la fecha de salida no puede ser inferior a la fecha de entrada
            if (fechaInicio_Objeto > fechaFinal_Objeto) {
                const error = "La fecha de entrada no puede ser superior que la fecha de salida, si pueden ser iguales para hacer un comportamiento de un solo dia";
                throw new Error(error);
            }

        }
        //let diasCSV
        if (tipo === "porDias") {
            diasArray = validadoresCompartidos.tipos.array({
                array: entrada.body.diasArray,
                nombreCampo: "El diasArray",
                filtro: "soloCadenasIDV",
                nombreCompleto: "En diasArray",
                noSePermitenDuplicados: "si"
            })

            const diasIDV = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
            const elementosNoEnArray = (diasArray, diasIDV) => {
                return diasArray.filter(elemento => !diasIDV.includes(elemento));
            };
            const elementosNoEnArreglo2 = elementosNoEnArray(diasArray, diasIDV);
            if (elementosNoEnArreglo2.length > 0) {
                const error = "En el array de diasArray no se reconoce: " + elementosNoEnArreglo2;
                throw new Error(error);
            }
        }


        const identificadoresVisualesEnArray = [];
        apartamentos.forEach((apart) => {
            if (typeof apart !== "object" || Array.isArray(apart) || apart === null) {
                const error = "Dentro del array de apartamentos se esperaba un objeto";
                throw new Error(error);
            }
            const apartamentoIDV_preProcesado = apart.apartamentoIDV;
            identificadoresVisualesEnArray.push(apartamentoIDV_preProcesado);
        });


        const apartamentosArreglo = [];
        for (const comportamiento of apartamentos) {
            const apartamentoIDV = comportamiento.apartamentoIDV;
            const cantidad = comportamiento.cantidad;
            const simbolo = comportamiento.simbolo;
            if (!apartamentoIDV || typeof apartamentoIDV !== "string" || !filtroCadenaSinEspacui.test(apartamentoIDV)) {
                const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios";
                throw new Error(error);
            }
            const validarApartamentoIDV = `
                                      SELECT 
                                      "apartamentoIDV"
                                      FROM 
                                      "configuracionApartamento"
                                      WHERE "apartamentoIDV" = $1
                                      `;
            const resuelveApartamentoIDV = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
            if (resuelveApartamentoIDV.rowCount === 0) {
                const error = "No existe ningún apartamento con ese identificador visual";
                throw new Error(error);
            }
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
            if (!simbolo || typeof simbolo !== "string" ||
                (
                    simbolo !== "aumentoPorcentaje" &&
                    simbolo !== "aumentoCantidad" &&
                    simbolo !== "reducirCantidad" &&
                    simbolo !== "reducirPorcentaje" &&
                    simbolo !== "precioEstablecido"
                )) {
                const error = `El campo simbolo de ${apartamentoUI} solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido`;
                throw new Error(error);
            }
            if (!cantidad || typeof cantidad !== "string" || !filtroCantidad.test(cantidad)) {
                const error = `El campo cantidad del ${apartamentoUI} solo admite una cadena con un numero con dos decimales separados por punto, es decir 00.00`;
                throw new Error(error);
            }
            if (cantidad === "00.00") {
                const error = "No se puede asignar una cantidad de cero";
                throw new Error(error);
            }
            apartamentosArreglo.push(apartamentoIDV);
        }
        // Validar nombre unico oferta
        const validarNombreComportamiento = `
                            SELECT "nombreComportamiento"
                            FROM "comportamientoPrecios"
                            WHERE "nombreComportamiento" = $1
                            `;
        const consultaValidarNombreComportamiento = await conexion.query(validarNombreComportamiento, [nombreComportamiento]);
        if (consultaValidarNombreComportamiento.rowCount > 0) {
            const error = "Ya existe un nombre exactamente igual a este comportamiento de precio, por favor elige otro nombre con el fin de evitar confusiones";
            throw new Error(error);
        }
        // Validacion de unicidad por tipo
        const dataEvitarDuplicados = {
            tipo: tipo,
            transaccion: "crear",
            apartamentos: apartamentos,
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFinal_ISO: fechaFinal_ISO,
            diasArray: diasArray
        };

        await evitarDuplicados(dataEvitarDuplicados);


        const estadoInicalDesactivado = "desactivado";
        const crearComportamiento = `
                            INSERT INTO "comportamientoPrecios"
                            (
                                "nombreComportamiento",
                                "fechaInicio",
                                "fechaFinal",
                                 estado,
                                 tipo,
                                 "diasArray"
                            )
                            VALUES
                            (
                                COALESCE($1, NULL),
                                COALESCE($2::date, NULL),
                                COALESCE($3::date, NULL),
                                COALESCE($4, NULL),
                                COALESCE($5, NULL),
                                COALESCE($6::text[], NULL)
                            )
                            RETURNING uid;
                            `;
        const datos = [
            nombreComportamiento,
            fechaInicio_ISO,
            fechaFinal_ISO,
            estadoInicalDesactivado,
            tipo,
            diasArray
        ];

        const resuelveCrearComportamiento = await conexion.query(crearComportamiento, datos);
        if (resuelveCrearComportamiento.rowCount === 1) {
            const nuevoUIDComportamiento = resuelveCrearComportamiento.rows[0].uid;
            for (const comportamiento of apartamentos) {
                const apartamentoIDV = comportamiento.apartamentoIDV;
                let cantidad = comportamiento.cantidad;
                const simbolo = comportamiento.simbolo;
                const insertarComportamiento = `
                                    INSERT INTO "comportamientoPreciosApartamentos"
                                    (
                                        "comportamientoUID",
                                        "apartamentoIDV",
                                         cantidad,
                                         simbolo
                                    )
                                    VALUES
                                    (
                                        NULLIF($1::numeric, NULL),
                                        NULLIF($2, NULL),
                                        NULLIF($3::numeric, NULL),
                                        NULLIF($4, NULL)
                                    )
                                    `;
                const detalleComportamiento = [
                    nuevoUIDComportamiento,
                    apartamentoIDV,
                    cantidad,
                    simbolo
                ];
                const resuelveInsertarComportamiento = await conexion.query(insertarComportamiento, detalleComportamiento);
                if (resuelveInsertarComportamiento.rowCount === 0) {
                    const error = `Ha ocurrido un error y no se ha podido insertar el apartamento ${apartamentoIDV} en el comportamiento`;
                    throw new Error(error);
                }
            }
            await conexion.query('COMMIT');
            const ok = {
                ok: "Se ha creado correctamente el comportamiento",
                nuevoUIDComportamiento: nuevoUIDComportamiento
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}