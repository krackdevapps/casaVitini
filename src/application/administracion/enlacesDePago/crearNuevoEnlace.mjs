import { insertarEnlaceDePago } from "../../../infraestructure/repository/enlacesDePago/insertarEnlaceDePago.mjs";
import { obtenerEnlaceDePagoPorCodigoUPID } from "../../../infraestructure/repository/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs";
import { obtenerReservaPorReservaUID } from "../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../shared/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

export const crearNuevoEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 5
        })
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })


        const nombreEnlace = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreEnlace || `Enlace de pago de la reserva ${reservaUID}`,
            nombreCampo: "El campo del nombreEnlace",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const cantidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.cantidad,
            nombreCampo: "El campo cantidad",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })

        const horasCaducidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.horasCaducidad || "72",
            nombreCampo: "El campo horasCaducidad",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })

        const descripcion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.descripcion || "",
            nombreCampo: "El campo del descripcion",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            validadoresCompartidos.tipos.cadena({
                string: testingVI,
                nombreCampo: "El campo testingVI",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
        }

        await controlCaducidadEnlacesDePago();
        const resuelveValidarReserva = await obtenerReservaPorReservaUID(reservaUID);
        const estadoReserva = resuelveValidarReserva.estadoReservaIDV;

        if (estadoReserva === "cancelada") {
            const error = "No se puede generar un enlace de pago, porque la reserva está cancelada.";
            throw new Error(error);
        }
        if (estadoReserva !== "confirmada") {
            const error = "No se puede generar un enlace de pago de una reserva que no está confirmada, porque entonces el cliente podría pagar una reserva cuyo alojamiento no está garantizado.";
            throw new Error(error);
        }
        const generarCadenaAleatoria = (longitud) => {
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };

        const validarCodigo = async (codigoAleatorio) => {

            try {
                const codigoRepetidos = await obtenerEnlaceDePagoPorCodigoUPID({
                    codigoUPID: codigoAleatorio,
                    errorSi: "desactivado"
                })

                if (codigoRepetidos.length === 0) {
                    return false
                } else {
                    return true
                }

            } catch (error) {
                throw error
            }
        };
        const controlCodigo = async () => {
            const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
            let codigoGenerado;
            let codigoExiste;
            do {
                codigoGenerado = generarCadenaAleatoria(longitudCodigo);

                codigoExiste = await validarCodigo(codigoGenerado);

            } while (codigoExiste);

            return codigoGenerado;
        };

        const codigoAleatorioUnico = await controlCodigo();

        const fechaActual = new Date();
        const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
        const estadoPagoInicial = "noPagado";
        const nuevoEnlaceDePago = await insertarEnlaceDePago({
            nombreEnlace: nombreEnlace,
            reservaUID: reservaUID,
            descripcion: descripcion,
            fechaDeCaducidad: fechaDeCaducidad,
            cantidad: cantidad,
            codigoAleatorioUnico: codigoAleatorioUnico,
            estadoPagoInicial: estadoPagoInicial,
            testingVI: testingVI
        })

        const enlaceUID = nuevoEnlaceDePago.enlaceUID;
        const enlace = nuevoEnlaceDePago.codigo;
        const ok = {
            ok: "Se ha creado el enlace correctamente",
            enlaceUID: enlaceUID,
            nombreEnlace: nombreEnlace,
            cantidad: cantidad,
            enlace: enlace
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}