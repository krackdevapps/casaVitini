
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { insertarPerfilPrecio } from "../../../../infraestructure/repository/precios/insertarPerfilPrecio.mjs";
import { Mutex } from "async-mutex";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarConfiguracionApartamento } from "../../../../infraestructure/repository/arquitectura/configuraciones/insertarConfiguracionApartamento.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";

export const crearConfiguracionAlojamiento = async (entrada) => {
    const mutex = new Mutex()
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        mutex.acquire()
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })).apartamentoUI
        if (!apartamentoUI) {
            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podrás crear la configuración.";
            throw new Error(error);
        }

        await campoDeTransaccion("iniciar")
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "existe"
        })
        await insertarConfiguracionApartamento({
            apartamentoIDV: apartamentoIDV,
            estadoInicial: "desactivado",
            zonaIDV: "privada"
        })
        await insertarPerfilPrecio({
            apartamentoIDV: apartamentoIDV,
            precioInicial: "0.00"
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha creado correctamente la nueva configuración del apartamento.",
            apartamentoIDV: apartamentoIDV
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.acquire()
        }
    }
}