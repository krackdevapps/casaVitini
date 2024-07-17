import { Mutex } from "async-mutex";
import { evitarDuplicados } from "../../../sistema/contenedorFinanciero/comportamientoPrecios/evitarDuplicados.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { actualizarComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/actualizarComportamientoDePrecio.mjs";
import { eliminarApartamentosDelComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/eliminarApartamentosDelComportamientoDePrecioPorComportamientoUID.mjs";
import { insertarApartamentosDelComportamientoDePrecio } from "../../../repositorio/comportamientoDePrecios/insertarApartamentosDelComportamiento.mjs";
import { obtenerComportamientoDePrecioPorComportamientoUID } from "../../../repositorio/comportamientoDePrecios/obtenerComportamientoPorComportamientoUID.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../repositorio/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const actualizarComportamiento = async (entrada, salida) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        await mutex.acquire();
        const nombreComportamiento = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreComportamiento,
            nombreCampo: "El campo del nombreComportamiento",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const comportamientoUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.comportamientoUID,
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


        const zonaIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaIDV,
            nombreCampo: "La zonaIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (tipo !== "porDias" && tipo !== "porRango") {
            const error = "Por favor determine si el tipo de bloqueo es porRango o porDias.";
            throw new Error(error);
        }

        if (zonaIDV !== "publico" && zonaIDV !== "privado" && zonaIDV !== "global") {
            const error = "La zonaIDV de un bloqueo, solo puede ser publico, privado o global.";
            throw new Error(error);
        }


        const apartamentosIDV_array = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentosIDV_array,
            nombreCampo: "El array de apartamentos",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
        })

        let fechaInicio_ISO;
        let fechaFinal_ISO;
        let diasArray;
        await campoDeTransaccion("iniciar")

        await evitarDuplicados({
            comportamientoUID: comportamientoUID,
            tipo: tipo,
            transaccion: "actualizar",
            apartamentosIDV_array: apartamentosIDV_array,
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFinal_ISO: fechaFinal_ISO,
            zonaIDV: zonaIDV,
            diasArray: diasArray
        })

        if (tipo === "porRango") {
            const fechaInicio_ISO = entrada.body.fechaInicio_ISO;
            const fechaFinal_ISO = entrada.body.fechaFinal_ISO;

            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaInicio_ISO,
                nombreCampo: "La fecha de incio del comportamiento"
            })
            await validadoresCompartidos.fechas.validarFecha_ISO({
                fecha_ISO: fechaFinal_ISO,
                nombreCampo: "La fecah del fin del comportameinto"
            })
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
                sePermitenDuplicados: "no"
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
                sePermitenDuplicados: "no"
            })
            const apartamentoIDV_preProcesado = apart.apartamentoIDV;
            identificadoresVisualesEnArray.push(apartamentoIDV_preProcesado);
        });

        validadoresCompartidos.tipos.array({
            array: identificadoresVisualesEnArray,
            nombreCampo: "El array de identificadoresVisualesEnArray",
            filtro: "soloCadenasIDV",
            sePermitenDuplicados: "no"
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
            await obtenerConfiguracionPorApartamentoIDV(apartamentoIDV)
            const apartamentoUI = await obtenerApartamentoComoEntidadPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            }).apartamentoUI;
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

        const comportamientoDePrecio = await obtenerComportamientoDePrecioPorComportamientoUID(comportamientoUID)
        const estadoComportamiento = comportamientoDePrecio.estado;
        if (estadoComportamiento === "activado") {
            const error = "No se puede modificar un comportamiento de precio que esta activo. Primero desativalo con el boton de estado de color rojo en la parte superior izquierda, al lado del nombre.";
            throw new Error(error);
        }


        const dataActualizarComportamientoDePrecio = {
            nombreComportamiento: nombreComportamiento,
            fechaInicio_ISO: fechaInicio_ISO,
            fechaFinal_ISO: fechaFinal_ISO,
            tipo: tipo,
            diasArray: diasArray,
            comportamientoUID: comportamientoUID
        }
        await actualizarComportamientoDePrecio(dataActualizarComportamientoDePrecio)
        await eliminarApartamentosDelComportamientoDePrecioPorComportamientoUID(comportamientoUID)

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
            const dataInsertarApartamentosDelComportamientoDePrecio = {
                apartamentoIDV: apartamentoIDV,
                simbolo: simbolo,
                cantidadPorApartamento: cantidadPorApartamento,
                comportamientoUID: comportamientoUID
            }
            await insertarApartamentosDelComportamientoDePrecio(dataInsertarApartamentosDelComportamientoDePrecio)
        }
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "El comportamiento se ha actualizado bien junto con los apartamentos dedicados",
        };
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")

        throw errorFinal
    } finally {
        mutex.release();
    }
}