import { obtenerComplementoPorComplementoUIDArray } from "../../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUIDArray.mjs"

export const validadorComplementosDeAlojamiento = async (data) => {

    const complementosAlojamiento = data.complementosAlojamiento
    const schemaControl = data.schemaControl
    const complementosDeAlojamientoSiRecononcidos = data.complementosDeAlojamientoSiRecononcidos

    const complementosDeAlojamientosUIDSolicitados = complementosAlojamiento.map(c => { return c.complementoUID })

    if (complementosDeAlojamientosUIDSolicitados.length > 0) {

        const complementosSiReconocidos = await obtenerComplementoPorComplementoUIDArray({
            complementoUIDArray: complementosDeAlojamientosUIDSolicitados,
            estadoIDV: "activado"
        })
        const complementosSiReonocidosSoloUID = complementosSiReconocidos.map(c => { return c.complementoUID })

        schemaControl.complementosAlojamiento = {
            complementosSiReconocidos: complementosSiReconocidos,
            complementosNoReconocidos: complementosAlojamiento.filter(c => !complementosSiReonocidosSoloUID.includes(c.complementoUID))
        }
        complementosDeAlojamientoSiRecononcidos.push(...complementosSiReonocidosSoloUID)
    }
}