import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { evitarDuplicados } from "../../../sistema/sistemaDePrecios/comportamientoPrecios/evitarDuplicados.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";

export const actualizarComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();
    await mutex.acquire();
    try {
        let nombreComportamiento = entrada.body.nombreComportamiento;

        const comportamientoUID = entrada.body.comportamientoUID;
        const apartamentos = entrada.body.apartamentos;
        const tipo = entrada.body.tipo;

        const filtroCantidad = /^\d+\.\d{2}$/;
        const filtroNombre = /['"\\;\r\n<>\t\b]/g;
        const filtroCadenaSinEspacio = /^[a-z0-9]+$/;
        if (!comportamientoUID || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
            const error = "El campo comportamientoUID tiene que ser un numero, positivo y entero";
            throw new Error(error);
        }
        if (!nombreComportamiento) {
            const error = "El campo nombreComportamiento solo admite minúsculas, mayúsculas, numeros y espacios";
            throw new Error(error);
        }
        nombreComportamiento = nombreComportamiento.replace(filtroNombre, '');
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
            diasArray = entrada.body.diasArray;

            if (typeof diasArray !== 'object' && !Array.isArray(diasArray)) {
                const error = "El campo diasArray solo admite un arreglo";
                throw new Error(error);
            }
            if (diasArray.length === 0) {
                const error = "Seleccione al menos un dia por favor.";
                throw new Error(error);
            }

            // Control elemento repetidos
            const contador = {};
            for (const elemento of diasArray) {
                if (typeof elemento !== "string") {
                    const error = "En el array solo se esperan strings, revisa el array por que hay elemento que no son cadenas.";
                    throw new Error(error);
                }
                const filtroElemento = String(elemento).toLocaleLowerCase();
                if (contador[filtroElemento]) {
                    const error = "En el array de diasArray no puede haber dos elementos repetidos";
                    throw new Error(error);
                } else {
                    contador[filtroElemento] = 1;
                }
            }

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
        if (typeof apartamentos !== 'object' && !Array.isArray(apartamentos)) {
            const error = "El campo apartamentos solo admite un arreglo";
            throw new Error(error);
        }
        if (apartamentos.length === 0) {
            const error = "Anada al menos un apartmento dedicado";
            throw new Error(error);
        } else {
            const identificadoresVisualesEnArray = [];
            apartamentos.forEach((apart) => {
                if (typeof apart !== "object" || Array.isArray(apart) || apart === null) {
                    const error = "Dentro del array de apartamentos se esperaba un objeto";
                    throw new Error(error);
                }
                const apartamentoIDV_preProcesado = apart.apartamentoIDV;
                identificadoresVisualesEnArray.push(apartamentoIDV_preProcesado);
            });
            const identificadoresVisualesRepetidos = identificadoresVisualesEnArray.filter((elem, index) => identificadoresVisualesEnArray.indexOf(elem) !== index);
            if (identificadoresVisualesRepetidos.length > 0) {
                const error = "Existen identificadores visuales repetidos en el array de apartamentos";
                throw new Error(error);
            }
        }

        if (typeof apartamentos !== 'object' && !Array.isArray(apartamentos)) {
            const error = "El campo apartamentos solo admite un arreglo";
            throw new Error(error);
        }
        if (apartamentos.length === 0) {
            const error = "Anada al menos un apartmento dedicado";
            throw new Error(error);
        }
        const apartamentosArreglo = [];
        for (const comportamiento of apartamentos) {
            const apartamentoIDV = comportamiento.apartamentoIDV;
            const cantidad = comportamiento.cantidad;
            const simbolo = comportamiento.simbolo;
            if (!apartamentoIDV || typeof apartamentoIDV !== "string" || !filtroCadenaSinEspacio.test(apartamentoIDV)) {
                const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios";
                throw new Error(error);
            }
            //Validar existencia del apartamento
            // Validar nombre unico oferta
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
            const filtroCadenaSinEspacui = /^[a-z0-9]+$/;
            for (const comportamiento of apartamentos) {
                const apartamentoIDV = comportamiento.apartamentoIDV;
                const simbolo = comportamiento.simbolo;
                let cantidadPorApartamento = comportamiento.cantidad;
                if (!apartamentoIDV || !filtroCadenaSinEspacui.test(apartamentoIDV)) {
                    const error = "El campo apartamentoIDV solo admite minúsculas, numeros y espacios";
                    throw new Error(error);
                }
                if (!simbolo ||
                    (
                        simbolo !== "aumentoPorcentaje" &&
                        simbolo !== "aumentoCantidad" &&
                        simbolo !== "reducirCantidad" &&
                        simbolo !== "reducirPorcentaje" &&
                        simbolo !== "precioEstablecido"
                    )) {
                    const error = "El campo simbolo solo admite aumentoPorcentaje,aumentoCantidad,reducirCantidad,reducirPorcentaje y precioEstablecido";
                    throw new Error(error);
                }
                if (!cantidadPorApartamento || !filtroCantidad.test(cantidadPorApartamento)) {
                    const error = "El campo cantidad solo admite una cadena con un numero con dos decimales separados por punto. Asegurate de escribir los decimales";
                    throw new Error(error);
                }
                cantidadPorApartamento = Number(cantidadPorApartamento);
                if (cantidadPorApartamento === 0) {
                    const error = "No se puede asignar una cantidad de cero por seguridad";
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