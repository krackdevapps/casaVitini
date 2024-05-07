import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { evitarDuplicados } from "../../../sistema/sistemaDePrecios/comportamientoPrecios/evitarDuplicados.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const actualizarComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        await mutex.acquire();
        const nombreComportamiento = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreComportamiento,
            nombreCampo: "El campo del nombreComportamiento",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const comportamientoUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.comportamientoUID,
            nombreCampo: "El identificador universal del compotamiento (comportamientoUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

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

        const apartamentos = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentos,
            nombreCampo: "El array de apartamentos",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })

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
            const fechaFinArreglo = fechaFinal.split("/");
            const diaSalida = fechaFinArreglo[0];
            const mesSalida = fechaFinArreglo[1];
            const anoSalida = fechaFinArreglo[2];
            fechaInicio_ISO = `${anoEntrada}-${mesEntrada}-${diaEntrada}`;
            fechaFinal_ISO = `${anoSalida}-${mesSalida}-${diaSalida}`;
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaInicio_ISO);
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaFinal_ISO);
            const fechaInicio_Objeto = new Date(fechaInicio_ISO); // El formato es día/mes/ano
            const fechaFinal_Objeto = new Date(fechaFinal_ISO);
            if (fechaInicio_Objeto > fechaFinal_Objeto) {
                const error = "La fecha de entrada no puede ser superior que la fecha de salida";
                throw new Error(error);
            }
        }
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
                const error = "En el array de diasSeleccionados no se reconoce: " + elementosNoEnArreglo2;
                throw new Error(error);
            }
        }


        const identificadoresVisualesEnArray = [];
        apartamentos.forEach((apart) => {

            validadoresCompartidos.tipos.objetoLiteral({
                array: apart,
                nombreCampo: "Dentro de array de apartamentos",
                filtro: "soloCadenasIDV",
                noSePermitenDuplicados: "si"
            })
            const apartamentoIDV_preProcesado = apart.apartamentoIDV;
            identificadoresVisualesEnArray.push(apartamentoIDV_preProcesado);
        });

        validadoresCompartidos.tipos.array({
            array: identificadoresVisualesEnArray,
            nombreCampo: "El array de identificadoresVisualesEnArray",
            filtro: "soloCadenasIDV",
            noSePermitenDuplicados: "si"
        })

        const apartamentosArreglo = [];
        for (const comportamiento of apartamentos) {
            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                string: comportamiento.apartamentoIDV,
                nombreCampo: "El apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const cantidad = validadoresCompartidos.tipos.cadena({
                string: comportamiento.cantidad,
                nombreCampo: "El campo cantidad",
                filtro: "cadenaConNumerosConDosDecimales",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                impedirCero: "si"
            })

            const simbolo = validadoresCompartidos.tipos.cadena({
                string: comportamiento.simbolo,
                nombreCampo: "El simbolo",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            //Validar existencia del apartamento
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
            if (simbolo !== "aumentoPorcentaje" &&
                simbolo !== "aumentoCantidad" &&
                simbolo !== "reducirCantidad" &&
                simbolo !== "reducirPorcentaje" &&
                simbolo !== "precioEstablecido") {
                const error = `El campo simbolo de ${apartamentoUI} solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido`;
                throw new Error(error);
            }
            apartamentosArreglo.push(apartamentoIDV);
        }
        // Validar nombre unico oferta
        const validarComportamiento = `
                            SELECT 
                            estado
                            FROM 
                            "comportamientoPrecios"
                            WHERE uid = $1
                            `;
        const resuelveValidarComportamiento = await conexion.query(validarComportamiento, [comportamientoUID]);
        if (resuelveValidarComportamiento.rowCount === 0) {
            const error = "No existe ningún comportamiento de precios con ese identificador";
            throw new Error(error);
        }
        const estadoComportamiento = resuelveValidarComportamiento.rows[0].estado;
        if (estadoComportamiento === "activado") {
            const error = "No se puede modificar un comportamiento de precio que esta activo. Primero desativalo con el boton de estado de color rojo en la parte superior izquierda, al lado del nombre.";
            throw new Error(error);
        }
        const dataEvitarDuplicados = {
            comportamientoUID: comportamientoUID,
            tipo: tipo,
            transaccion: "actualizar",
            apartamentos: apartamentos,
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFinal_ISO: fechaFinal_ISO,
            diasArray: diasArray
        };

        await evitarDuplicados(dataEvitarDuplicados);

        const actualizarComportamiento = `
                            UPDATE "comportamientoPrecios"
                            SET 
                            "nombreComportamiento" = $1,
                            "fechaInicio" = $2,
                            "fechaFinal" = $3,
                            tipo = $4,
                            "diasArray" = $5
                            WHERE uid = $6
                            RETURNING *;
                            `;
        const datos = [
            nombreComportamiento,
            fechaInicio_ISO,
            fechaFinal_ISO,
            tipo,
            diasArray,
            comportamientoUID
        ];
        const resuelveActualizarComportamiento = await conexion.query(actualizarComportamiento, datos);
        if (resuelveActualizarComportamiento.rowCount === 1) {
            const eliminarComportamiento = `
                                DELETE FROM "comportamientoPreciosApartamentos"
                                WHERE "comportamientoUID" = $1 ;
                                `;
            await conexion.query(eliminarComportamiento, [comportamientoUID]);

            for (const comportamiento of apartamentos) {
                const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                    string: comportamiento.apartamentoIDV,
                    nombreCampo: "El apartamentoIDV",
                    filtro: "strictoIDV",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
                const simbolo = validadoresCompartidos.tipos.cadena({
                    string: comportamiento.simbolo,
                    nombreCampo: "El simbolo",
                    filtro: "strictoIDV",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
                const cantidadPorApartamento = validadoresCompartidos.tipos.cadena({
                    string: comportamiento.cantidad,
                    nombreCampo: "El campo cantidad",
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                    impedirCero: "si"

                })

                if (simbolo !== "aumentoPorcentaje" &&
                    simbolo !== "aumentoCantidad" &&
                    simbolo !== "reducirCantidad" &&
                    simbolo !== "reducirPorcentaje" &&
                    simbolo !== "precioEstablecido") {
                    const error = "El campo simbolo solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido";
                    throw new Error(error);
                }
                const actualizarComportamientoDedicado = `
                                        INSERT INTO "comportamientoPreciosApartamentos"
                                    (
                                        "apartamentoIDV",
                                        simbolo,
                                        cantidad,
                                        "comportamientoUID"
                                    )
                                        VALUES
                                    (
                                        NULLIF($1, NULL),
                                        COALESCE($2, NULL),
                                        COALESCE($3::numeric, NULL),
                                        NULLIF($4::numeric, NULL)
                                    )
                                        RETURNING *;
    
                                        `;
                const comportamientoDedicado = [
                    apartamentoIDV,
                    simbolo,
                    cantidadPorApartamento,
                    comportamientoUID
                ];
                await conexion.query(actualizarComportamientoDedicado, comportamientoDedicado);
            }
            await conexion.query('COMMIT'); // Confirmar la transacción
            const ok = {
                ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }
}