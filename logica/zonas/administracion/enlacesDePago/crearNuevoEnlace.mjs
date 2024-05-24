import { insertarEnlaceDePago } from "../../../repositorio/enlacesDePago/insertarEnlaceDePago.mjs";
import { obtenerEnlaceDePagoPorCodigoUPID } from "../../../repositorio/enlacesDePago/obtenerEnlaceDePagoPorCodigoUPID.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/enlacesDePago/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const crearNuevoEnlace = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
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
        })

        const horasCaducidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.horasCaducidad || 72,
            nombreCampo: "El campo horasCaducidad",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const descripcion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.descripcion,
            nombreCampo: "El campo del descripcion",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        await controlCaducidadEnlacesDePago();
        const resuelveValidarReserva = await obtenerReservaPorReservaUID(reservaUID);
        const estadoReserva = resuelveValidarReserva.estadoReservaIDV;

        if (estadoReserva === "cancelada") {
            const error = "No se puede generar un enlace de pago una reserva cancelada";
            throw new Error(error);
        }
        if (estadoReserva !== "confirmada") {
            const error = "No se puede generar un enlace de pago una reserva que no esta confirmada por que entonces el cliente podria pagar una reserva cuyo alojamiento no esta garantizado, reservado sin pagar vamos";
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
            // Se esta validando que no existe ningun enlace de pago con el mismo codiog UPID. Si no existe, el adaptaador manera el error de enlace inexistente y el trycatch de aqui devuelve true
            try {   
                await obtenerEnlaceDePagoPorCodigoUPID(codigoAleatorio)
            } catch (error) {
                return true
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
            // En este punto, tenemos un código único que no existe en la base de datos
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