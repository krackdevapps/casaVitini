import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { obtenerBloqueoPorBloqueoUID } from "../../../infraestructure/repository/bloqueos/obtenerBloqueoPorBloqueoUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";

export const detallesDelBloqueo = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const bloqueoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.bloqueoUID,
            nombreCampo: "El identificador universal de la bloque (bloqueoUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })



        await eliminarBloqueoCaducado();
        const apartamento = await obtenerApartamentoComoEntidadPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        const apartamentoUI = apartamento.apartamentoUI
        const detallesDelBloqueo = await obtenerBloqueoPorBloqueoUID(bloqueoUID)

        const tipoBloqueoIDV = detallesDelBloqueo.tipoBloqueoIDV;
        const fechaInicio = detallesDelBloqueo.fechaInicio;
        const fechaFin = detallesDelBloqueo.fechaFin;
        const motivo = detallesDelBloqueo.motivo || "";
        const zonaIDV = detallesDelBloqueo.zonaIDV;
        const estructuraBloqueo = {
            bloqueoUID,
            tipoBloqueoIDV,
            fechaInicio,
            fechaFin,
            motivo,
            zonaIDV
        };
        const ok = {};
        ok.apartamentoIDV = apartamentoIDV;
        ok.apartamentoUI = apartamentoUI;
        ok.ok = estructuraBloqueo;
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    }

}