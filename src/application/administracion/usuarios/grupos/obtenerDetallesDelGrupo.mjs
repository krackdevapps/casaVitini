import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { eliminarControladoresObsoletosPorArray } from "../../../../infraestructure/repository/secOps/eliminarControladoresObsoletosPorArray.mjs"
import { eliminarVistasObsoletasPorArray } from "../../../../infraestructure/repository/secOps/eliminarVistasObsoletasPorArray.mjs"
import { insertarControladores } from "../../../../infraestructure/repository/secOps/insertarControladores.mjs"
import { insertarVistas } from "../../../../infraestructure/repository/secOps/insertarVistas.mjs"
import { obtenerGrupoPorGrupoUID } from "../../../../infraestructure/repository/secOps/obtenerGrupoPorGrupoUID.mjs"
import { obtenerPermisosDeLasVistasPorGrupoUID } from "../../../../infraestructure/repository/secOps/obtenerPermisosDeLasVistasPorGrupoUID.mjs"
import { obtenerPermisosDeLosControladoresPorGrupoUID } from "../../../../infraestructure/repository/secOps/obtenerPermisosDeLosControladoresPorGrupoUID.mjs"
import { obtenerTodasLasVistas } from "../../../../infraestructure/repository/secOps/obtenerTodasLasVistas.mjs"
import { obtenerTodasLosControladores } from "../../../../infraestructure/repository/secOps/obtenerTodasLosControladores.mjs"
import { obtenerUsuariosDelGrupoPorGrupoUID } from "../../../../infraestructure/repository/secOps/obtenerUsuariosDelGrupoPorGrupoUID.mjs"
import { sincronizarPermisosGrupoPorControladores } from "../../../../infraestructure/repository/secOps/sincronizarPermisosGrupoPorControladores.mjs"
import { sincronizarPermisosGrupoPorVistaUIDPorGrupoUID } from "../../../../infraestructure/repository/secOps/sincronizarPermisosGrupoPorVistaUIDPorGrupoUID.mjs"
import { recorrerTodosLosDirectorios } from "../../../../shared/usuarios/grupos/recorrerTodosLosDirectorios.mjs"
import { validarGrupoOps } from "../../../../shared/usuarios/grupos/validarGrupoOps.mjs"

export const obtenerDetallesDelGrupo = async (entrada) => {
    try {
        const oVal = await validarGrupoOps({
            o: entrada.body,
            filtrosIDV: [
                "grupoUID",
                "contenedores"
            ]
        })
        await campoDeTransaccion("iniciar")
        const grupoUID = oVal.grupoUID
        const contenedores = oVal.contenedores

        let numeroFiltros = 0
        const ok = {
            ok: "Detalles del grupo",
        }

        if (contenedores.includes("grupo")) {
            numeroFiltros++

            const grupo = await obtenerGrupoPorGrupoUID(grupoUID)
            ok.grupo = grupo
        }

        if (contenedores.includes("usuarios")) {
            numeroFiltros++

            const usuariosDelGrupo = await obtenerUsuariosDelGrupoPorGrupoUID(grupoUID)
            ok.usuariosDelGrupo = usuariosDelGrupo
        }
        if (contenedores.includes("permisos")) {
            numeroFiltros++


            const rutas = await recorrerTodosLosDirectorios()
            const vistas = await obtenerTodasLasVistas()
            const controladores = await obtenerTodasLosControladores()

            const rutasVistas = rutas.vistas
            const rutasControladores = rutas.controladores

            const rutasVistasObsoletas = []
            const rutasControladoresObsoletas = []

            for (const v of vistas) {
                const vistaIDV = v.vistaIDV
                const vistaExistente = rutasVistas.includes(vistaIDV)
                if (!vistaExistente) {
                    rutasVistasObsoletas.push(vistaIDV)
                }
            }

            for (const c of controladores) {
                const controladorIDV = c.controladorIDVIDV
                const controladorExistente = rutasControladores.includes(controladorIDV)
                if (!controladorExistente) {
                    rutasControladoresObsoletas.push(controladorIDV)
                }
            }

            await eliminarVistasObsoletasPorArray({
                rutasVistasObsoletas
            })

            await eliminarControladoresObsoletosPorArray({
                rutasControladoresObsoletas
            })

            await insertarVistas({
                arrayVistas: rutasVistas
            })
            await insertarControladores({
                arrayControladores: rutasControladores
            })

            const vistasSincronizadas = await obtenerTodasLasVistas()
            const controladoresSincronizados = await obtenerTodasLosControladores()

            const nuevasVistasUID = vistasSincronizadas.map(nV => nV.vistaUID)
            const nuevosControladoresUID = controladoresSincronizados.map(nC => nC.controladorUID)

            await sincronizarPermisosGrupoPorVistaUIDPorGrupoUID({
                grupoUID,
                nuevasVistasUID
            })

            await sincronizarPermisosGrupoPorControladores({
                grupoUID,
                nuevosControladoresUID
            })

            const permisosDeLasVistasDelGrupo = await obtenerPermisosDeLasVistasPorGrupoUID(grupoUID)
            const permisosDeLosControladoresDelGrupo = await obtenerPermisosDeLosControladoresPorGrupoUID(grupoUID)

            ok.vistas = vistasSincronizadas
            ok.controladores = controladoresSincronizados
            ok.permisosDeLasVistasDelGrupo = permisosDeLasVistasDelGrupo
            ok.permisosDeLosControladoresDelGrupo = permisosDeLosControladoresDelGrupo
        }

        if (numeroFiltros !== contenedores.length) {
            throw new Error("Hay contenedores no reconocidos")

        }


        await campoDeTransaccion("confirmar")
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}