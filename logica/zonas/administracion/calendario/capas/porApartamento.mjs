import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { eventosPorApartamneto } from "../../../../sistema/calendarios/capas/eventosPorApartamento.mjs";
import { eliminarBloqueoCaducado } from "../../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";


export const porApartamento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const fecha = entrada.body.fecha;
        validadoresCompartidos.fechas.fechaMesAno(fecha)

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        await eliminarBloqueoCaducado();
        const metadatosEventos = {
            fecha: fecha,
            apartamentoIDV: apartamentoIDV
        };
        const eventos = await eventosPorApartamneto(metadatosEventos);
        const ok = {
            ok: "Aqui tienes las reservas de este mes",
            ...eventos
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return salida.json(error);
    }
}