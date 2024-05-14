import { Mutex } from "async-mutex";
import { evitarDuplicados } from "../../../sistema/precios/comportamientoPrecios/evitarDuplicados.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { obtenerNombreApartamentoUI } from "../../../repositorio/arquitectura/obtenerNombreApartamentoUI.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerNombreComportamientoPorNombreUI } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorNombreUI.mjs";
import { insertarComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/insertarComportamientoDePrecio.mjs";
import { campoDeTransaccion } from "../../../componentes/campoDeTransaccion.mjs";
import { insertarApartamentosDelComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/insertarApartamentosDelComportamiento.mjs";

export const crearComportamiento = async (entrada, salida) => {
    let mutex;
    try {
        await mutex.acquire();
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

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


        await campoDeTransaccion("iniciar")
        if (tipo === "porRango") {
            const fechaInicio_ISO = entrada.body.fechaInicio_ISO;
            const fechaFinal_ISO = entrada.body.fechaFinal_ISO;

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

            await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)

            const apartamentoUI = await obtenerNombreApartamentoUI(apartamentoIDV);
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
        const comportamientoPorNombreUI = await obtenerNombreComportamientoPorNombreUI(nombreComportamiento)
        if (comportamientoPorNombreUI.length > 0) {
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


        const dataInsertarComportamientoDePrecio = {
            nombreComportamiento: nombreComportamiento,
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFinal_ISO: fechaFinal_ISO,
            estadoInicalDesactivado: estadoInicalDesactivado,
            tipo: tipo,
            diasArray: diasArray
        }

        const nuevoComportamiento = await insertarComportamientoDePrecio(dataInsertarComportamientoDePrecio)
        const nuevoUIDComportamiento = nuevoComportamiento.uid;
        for (const comportamiento of apartamentos) {
            const apartamentoIDV = comportamiento.apartamentoIDV;
            const cantidad = comportamiento.cantidad;
            const simbolo = comportamiento.simbolo;
            const dataInsertarComportamientoDePrecio = {
                nuevoUIDComportamiento: nuevoUIDComportamiento,
                apartamentoIDV: apartamentoIDV,
                cantidad: cantidad,
                simbolo: simbolo
            }
            await insertarApartamentosDelComportamientoDePrecio(dataInsertarComportamientoDePrecio)

        }
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado correctamente el comportamiento",
            nuevoUIDComportamiento: nuevoUIDComportamiento
        };
        salida.json(ok);

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}