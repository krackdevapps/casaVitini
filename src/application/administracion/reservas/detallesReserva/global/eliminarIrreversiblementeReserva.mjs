import { Mutex } from "async-mutex";
import { vitiniCrypto } from "../../../../../shared/VitiniIDX/vitiniCrypto.mjs";

import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerUsuario } from "../../../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { eliminarReservaIrreversiblementePorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/eliminarReservaIrreversiblementePorReservaUID.mjs";
import { obtenerServiciosPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServiciosPorReservaUID.mjs";
import { sincronizarRegistros } from "../../../../../shared/reservas/detallesReserva/servicios/sincronizarRegistros.mjs";

export const eliminarIrreversiblementeReserva = async (entrada) => {
    const mutex = new Mutex()
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        await mutex.acquire();
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const clave = entrada.body.clave;
        if (!clave) {
            const error = "No has enviado la clave de tu usuario para confirmar la operación";
            throw new Error(error);
        }
        const usuarioIDX = entrada.session.usuario;
        await campoDeTransaccion("iniciar")

        const usuario = await obtenerUsuario({
            usuario: usuarioIDX,
            errorSi: "noExiste"

        })

        const claveActualHASH = usuario.clave;
        const sal = usuario.sal;
        const metadatos = {
            sentido: "comparar",
            clavePlana: clave,
            sal: sal,
            claveHash: claveActualHASH
        };
        const controlClave = vitiniCrypto(metadatos);
        if (!controlClave) {
            const error = "Revisa la contraseña actual que has escrito porque no es correcta";
            throw new Error(error);
        }
        await obtenerReservaPorReservaUID(reservaUID)
        const servicios_EnReserva = await obtenerServiciosPorReservaUID(reservaUID)
        for (const sER of servicios_EnReserva) {
            await sincronizarRegistros({
                servicioExistenteAccesible: sER
            })
        }


        await eliminarReservaIrreversiblementePorReservaUID(reservaUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha eliminado la reserva y su información asociada de forma irreversible."
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}