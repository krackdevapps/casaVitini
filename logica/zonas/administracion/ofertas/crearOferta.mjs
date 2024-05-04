import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";



export const crearOferta = async (entrada, salida) => {
    let mutex
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        mutex = new Mutex()
        await mutex.acquire();

        let nombreOferta = entrada.body.nombreOferta;
        const fechaInicio = entrada.body.fechaInicio;
        const fechaFin = entrada.body.fechaFin;
        const tipoOferta = entrada.body.tipoOferta;
        const tipoDescuento = entrada.body.tipoDescuento ? entrada.body.tipoDescuento : null;
        let cantidad = entrada.body.cantidad;
        const contextoAplicacion = entrada.body.contextoAplicacion;
        const apartamentosSeleccionados = entrada.body.apartamentosSeleccionados;
        const simboloNumero = entrada.body.simboloNumero;
        const numero = entrada.body.numero;
        const filtroCantidad = /^\d+(\.\d{1,2})?$/;
        const filtroNombre = /['"\\;\r\n<>\t\b]/g;
        const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;



        if (!nombreOferta) {
            const error = "El campo nombreOferta no admice comillas simples o dobles";
            throw new Error(error);
        }
        nombreOferta = nombreOferta.replace(filtroNombre, '');

        const fechaInicio_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaInicio)).fecha_ISO;
        const fechaFin_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaFin)).fecha_ISO;
        const fechaInicio_objeto = DateTime.fromISO(fechaInicio_ISO);
        const fechaFin_objeto = DateTime.fromISO(fechaFin_ISO);
        if (fechaInicio_objeto > fechaFin_objeto) {
            const error = "La fecha de inicio de la oferta no puede ser inferior a la fecha del fin de la oferta";
            throw new Error(error);
        }
        if (tipoOferta !== "porNumeroDeApartamentos" &&
            tipoOferta !== "porApartamentosEspecificos" &&
            tipoOferta !== "porDiasDeAntelacion" &&
            tipoOferta !== "porRangoDeFechas" &&
            tipoOferta !== "porDiasDeReserva") {
            const error = "No se reconoce el tipo de oferta";
            throw new Error(error);
        }
        // Validar nombre unico oferta
        const validarNombreOfertaUnico = `
                                    SELECT "nombreOferta"
                                    FROM ofertas
                                    WHERE "nombreOferta" = $1
                                    `;
        const consultaValidarNombreOfertaUnico = await conexion.query(validarNombreOfertaUnico, [nombreOferta]);
        if (consultaValidarNombreOfertaUnico.rowCount > 0) {
            const error = "Ya existe un nombre de oferta exactamente igual a este, por favor elige otro nombre para esta oferta con el fin de evitar confusiones";
            throw new Error(error);
        }
        if (tipoDescuento === "precioEstablecido") {
            const controlPrecioEstablecido = `
                                SELECT 
                                *
                                FROM ofertas
                                WHERE ("fechaInicio" <= $1 AND "fechaFin" >= $2) AND "tipoDescuento" = $3;
                                `;
            const resuelveControlPrecioEstablecido = await conexion.query(controlPrecioEstablecido, [fechaInicio_ISO, fechaFin_ISO, tipoDescuento]);
        }
        const validadores = {
            numero: (numero) => {
                numero = Number(numero);
                if (!numero || !Number.isInteger(numero) || numero <= 0) {
                    const error = "El campo numero debe de ser un numer entero y positivo1";
                    throw new Error(error);
                }
            },
            simboloNumero: (simboloNumero) => {
                if (!simboloNumero || (simboloNumero !== "numeroExacto" && simboloNumero !== "aPartirDe")) {
                    const error = "El campo simboloNumero debe de ser un numer entero y positivo";
                    throw new Error(error);
                }
            },
            tipoDescuento: (tipoDescuento) => {
                if (!tipoDescuento || (tipoDescuento !== "cantidadFija" && tipoDescuento !== "porcentaje")) {
                    const error = `El tipo de descuento solo puede ser cantidadFija, porcentable o precioEstablecido`;
                    throw new Error(error);
                }
            },
            contextoAplicacion: (contextoAplicacion) => {
                if (!contextoAplicacion || (contextoAplicacion !== "totalNetoReserva" && contextoAplicacion !== "totalNetoApartamentoDedicado")) {
                    const error = `El campo contexto de aplicación solo puede ser, totalNetoReserva, totalNetoApartamentoDedicado`;
                    throw new Error(error);
                }
            },
            cantidad: (cantidad) => {
                if (!cantidad || !filtroCantidad.test(cantidad)) {
                    const error = "El campo cantidad debe ser un número con un máximo de dos decimales separados por punto. Recuerda que number es sin comillas.";
                    throw new Error(error);
                }
                cantidad = Number(cantidad);
            },
            controlLimitePorcentaje: (tipoDescuento, cantidad) => {
                if (tipoDescuento === "porcentaje" && new Decimal(cantidad).greaterThan(100)) {
                    const error = "Cuidado! No se puede acepatar un porcentaje superior a 100% por que sino la oferta podria generar numeros negativos.";
                    throw new Error(error);
                }
            }
        };
        await conexion.query('BEGIN'); // Inicio de la transacción
        const inertarOfertaValidada = async (metadatos) => {
            try {
                const nombreOferta = metadatos.nombreOferta;
                const fechaInicio_ISO = metadatos.fechaInicio_ISO;
                const fechaFin_ISO = metadatos.fechaFin_ISO;
                const simboloNumero = metadatos.simboloNumero;
                const numero = metadatos.numero;
                const contextoAplicacion = metadatos.contextoAplicacion;
                const estadoInicalDesactivado = "desactivada";
                const tipoOferta = metadatos.tipoOferta;
                const cantidad = metadatos.cantidad;
                const tipoDescuento = metadatos.tipoDescuento;
                const crearOfertaDesactivada = `
                                        INSERT INTO ofertas
                                        (
                                            "nombreOferta",
                                            "fechaInicio",
                                            "fechaFin",
                                            "simboloNumero",
                                            "numero",
                                            "descuentoAplicadoA",
                                            "estadoOferta",
                                            "tipoOferta",
                                            cantidad,
                                            "tipoDescuento"
                                        )
                                        VALUES
                                        (
                                            COALESCE($1, NULL),
                                            COALESCE($2::date, NULL),
                                            COALESCE($3::date, NULL),
                                            NULLIF($4, NULL),
                                            NULLIF($5::numeric, NULL),
                                            COALESCE($6, NULL),
                                            COALESCE($7, NULL),
                                            COALESCE($8, NULL),
                                            NULLIF($9::numeric, NULL),
                                            NULLIF($10, NULL)
                                        )
                                        RETURNING uid;
                                        `;
                const datos = [
                    nombreOferta,
                    fechaInicio_ISO,
                    fechaFin_ISO,
                    simboloNumero,
                    numero,
                    contextoAplicacion,
                    estadoInicalDesactivado,
                    tipoOferta,
                    cantidad,
                    tipoDescuento
                ];
                const resuelveCrearOfertaDesactivada = await conexion.query(crearOfertaDesactivada, datos);
                if (resuelveCrearOfertaDesactivada.rowCount === 1) {
                    const estructuraFinal = {
                        ok: "Se ha creado la oferta correctamente",
                        nuevoUIDOferta: resuelveCrearOfertaDesactivada.rows[0].uid
                    };
                    return estructuraFinal;
                }
                if (resuelveCrearOfertaDesactivada.rowCount === 0) {
                    const error = "Ha ocurrido un error y no se ha insertado la oferta";
                    throw new Error(error);
                }
            } catch (error) {
                throw error;
            }
        };
        if (tipoOferta === "porNumeroDeApartamentos") {
            validadores.simboloNumero(simboloNumero);
            validadores.numero(numero);
            validadores.cantidad(cantidad);
            validadores.tipoDescuento(tipoDescuento);
            validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                simboloNumero: simboloNumero,
                numero: numero,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            const resolutor = await inertarOfertaValidada(oferta);
            salida.json(resolutor);
        }
        if (tipoOferta === "porApartamentosEspecificos") {
            const filtroCadena = /^[a-zA-Z0-9]+$/;
            const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
            if (typeof apartamentosSeleccionados !== 'object' && !Array.isArray(apartamentosSeleccionados)) {
                const error = "El campo apartamentosSeleccionados solo admite un arreglo";
                throw new Error(error);
            }
            if (apartamentosSeleccionados.length === 0) {
                const error = "Anada al menos un apartmento dedicado";
                throw new Error(error);
            }
            validadores.contextoAplicacion(contextoAplicacion);
            if (contextoAplicacion === "totalNetoReserva") {
                validadores.cantidad(cantidad);
                validadores.tipoDescuento(tipoDescuento);
                validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
            }
            for (const apartamentoSeleccionado of apartamentosSeleccionados) {
                const apartamentoIDV = apartamentoSeleccionado.apartamentoIDV;
                const apartamentoUI = apartamentoSeleccionado.apartamentoUI;
                const tipoDescuentoApartamento = apartamentoSeleccionado.tipoDescuento;
                const cantidadPorApartamento = apartamentoSeleccionado.cantidad;
                if (!apartamentoIDV || !filtroCadena.test(apartamentoIDV)) {
                    const error = "El campo apartamentoIDV solo admite minúsculas, mayúsculas y numeros nada mas ni espacios";
                    throw new Error(error);
                }
                if (!apartamentoUI || !filtroCadenaUI.test(apartamentoUI)) {
                    const error = "El campo apartamentoUI solo admite minúsculas, mayúsculas, numeros y espacios nada mas ni espacios";
                    throw new Error(error);
                }
                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                    if (!tipoDescuentoApartamento || (tipoDescuentoApartamento !== "cantidadFija" && tipoDescuentoApartamento !== "porcentaje") && tipoDescuentoApartamento !== "precioEstablecido") {
                        const error = `El apartamento ${apartamentoUI} debe de tener un tipo de descuente seleccionado, revisa los apartamentos para ver si en alguno falta un tipo de descuente`;
                        throw new Error(error);
                    }
                    if (!cantidadPorApartamento || typeof cantidadPorApartamento !== "string" || !filtroCantidad.test(cantidadPorApartamento)) {
                        const error = `El campo cantidad del ${apartamentoUI} dedicado debe ser un número con un máximo de dos decimales separados por punto. Escribe los decimales igualmente, ejemplo 10.00`;
                        throw new Error(error);
                    }
                    validadores.controlLimitePorcentaje(tipoDescuentoApartamento, cantidadPorApartamento);
                }
            }
            // No pueden existir dos apartamentos o mas iguales
            const apartamentosSeleccionadosPreProcesados = apartamentosSeleccionados.map((detallesApartamento) => { return detallesApartamento.apartamentoIDV; });
            const apartamentosSeleccionadosUnicos = new Set(apartamentosSeleccionadosPreProcesados);
            const controlApartamentosIDV = apartamentosSeleccionadosPreProcesados.length !== apartamentosSeleccionadosUnicos.size;
            if (controlApartamentosIDV) {
                const error = "No se permiten apartamentos repetidos en el objeto de apartamentosSeleccionados";
                throw new Error(error);
            }
            // que los identificadores no existan.
            const consultaValidarApartamentoIDV = `
                                SELECT
                                "apartamentoIDV"
                                FROM
                                "configuracionApartamento"
                                WHERE
                                "apartamentoIDV" = ANY($1)
                                `;
            const resuelveConsultaValidarApartamentoIDV = await conexion.query(consultaValidarApartamentoIDV, [apartamentosSeleccionadosPreProcesados]);
            // Extraer los valores encontrados en la base de datos
            const apartamentosIDVEncontrados = resuelveConsultaValidarApartamentoIDV.rows.map(row => row.apartamentoIDV);
            // Encontrar las cadenas que no coincidieron
            const cadenasNoCoincidentes = apartamentosSeleccionadosPreProcesados.filter(apartamentoIDV => !apartamentosIDVEncontrados.includes(apartamentoIDV));
            if (cadenasNoCoincidentes.length > 0) {
                const error = `Se hace referencia a identificadores visuales de apartamentos que no existen. Por favor revisa los identificadores de los apartamentos a lo que quieres aplicar una oferta por que no existen`;
                throw new Error(error);
            }
            if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                cantidad = null;
            }
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            const resolutor = await inertarOfertaValidada(oferta);
            const nuevoUIDOferta = resolutor.nuevoUIDOferta;
            for (const apartamentoDedicado of apartamentosSeleccionados) {
                const apartamentoIDV = apartamentoDedicado.apartamentoIDV;
                let tipoDescuento = null;
                let cantidadPorApartamento = null;
                if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                    tipoDescuento = apartamentoDedicado.tipoDescuento;
                    cantidadPorApartamento = apartamentoDedicado.cantidad;
                    cantidadPorApartamento = Number(cantidadPorApartamento);
                }
                const ofertaApartamentosDedicados = `
                                    INSERT INTO "ofertasApartamentos"
                                    (
                                        oferta,
                                        apartamento,
                                        "tipoDescuento",
                                        cantidad
                                    )
                                    VALUES
                                    (
                                        NULLIF($1::numeric, NULL),
                                        NULLIF($2, NULL),
                                        NULLIF($3, NULL),
                                        NULLIF($4::numeric, NULL)
                                    )
                                    `;
                const detallesApartamentoDedicado = [
                    nuevoUIDOferta,
                    apartamentoIDV,
                    tipoDescuento,
                    cantidadPorApartamento
                ];
                await conexion.query(ofertaApartamentosDedicados, detallesApartamentoDedicado);
            }
            const ok = {
                "ok": "La oferta se ha creado bien",
                "nuevoUIDOferta": nuevoUIDOferta
            };
            salida.json(ok);
        }
        if (tipoOferta === "porDiasDeAntelacion") {
            validadores.simboloNumero(simboloNumero);
            validadores.numero(numero);
            validadores.cantidad(cantidad);
            validadores.tipoDescuento(tipoDescuento);
            validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                simboloNumero: simboloNumero,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                numero: numero,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            const resolutor = await inertarOfertaValidada(oferta);
            salida.json(resolutor);
        }
        if (tipoOferta === "porDiasDeReserva") {
            validadores.simboloNumero(simboloNumero);
            validadores.numero(numero);
            validadores.cantidad(cantidad);
            validadores.tipoDescuento(tipoDescuento);
            validadores.controlLimitePorcentaje(tipoDescuento, cantidad);
            //    simboloNumero = entrada.body.simboloNumero
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                simboloNumero: simboloNumero,
                numero: numero,
                contextoAplicacion: contextoAplicacion,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            const resolutor = await inertarOfertaValidada(oferta);
            salida.json(resolutor);
        }
        if (tipoOferta === "porRangoDeFechas") {
            validadores.tipoDescuento(tipoDescuento);
            validadores.cantidad(cantidad);
            const oferta = {
                nombreOferta: nombreOferta,
                fechaInicio_ISO: fechaInicio_ISO,
                fechaFin_ISO: fechaFin_ISO,
                tipoOferta: tipoOferta,
                cantidad: cantidad,
                tipoDescuento: tipoDescuento
            };
            const resolutor = await inertarOfertaValidada(oferta);
            salida.json(resolutor);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}