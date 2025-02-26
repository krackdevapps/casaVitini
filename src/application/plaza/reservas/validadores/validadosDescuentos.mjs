import { validarDescuentosPorCodigo } from "../../../../shared/reservas/nuevaReserva/reservaPulica/validarDescuentosPorCodigo.mjs"

export const validadorDescuentos = async (data) => {

    const contenedorCodigosDescuento = data.contenedorCodigosDescuento
    const schemaControl = data.schemaControl
    const soloCodigosBase64Descunetos = data.soloCodigosBase64Descunetos
    const fechaEntrada = data.fechaEntrada
    const fechaSalida = data.fechaSalida
    const apartamentosIDV = data.apartamentosIDV

    const codigosDescuentosSiReconocidos = []
    if (contenedorCodigosDescuento.length > 0) {
        const controlCodigosDescuentos = await validarDescuentosPorCodigo({
            zonasArray: ["global", "publica"],
            contenedorCodigosDescuento: contenedorCodigosDescuento,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            apartamentosArray: apartamentosIDV
        })
        codigosDescuentosSiReconocidos.push(...controlCodigosDescuentos.codigosDescuentosSiReconocidos)

        const cSiReconocidos = controlCodigosDescuentos.codigosDescuentosSiReconocidos
        cSiReconocidos.forEach((contenedor) => {
            const codigosUID = contenedor.codigosUID
            codigosUID.forEach((codigo, i) => {
                const buffer = Buffer.from(codigo, 'base64');
                codigo = buffer.toString('utf-8');
                codigosUID[i] = buffer.toString('utf-8');
            })
        })
        const cNoReconocidos = controlCodigosDescuentos.codigosDescuentosNoReconocidos


        cNoReconocidos.forEach((contenedor) => {
            const codigosUID = contenedor.codigosUID

            codigosUID.forEach((codigo, i) => {
                const buffer = Buffer.from(codigo, 'base64');
                codigo = buffer.toString('utf-8');
                codigosUID[i] = buffer.toString('utf-8');
            })
        })
        schemaControl.codigosDescuentos = controlCodigosDescuentos
    }

    codigosDescuentosSiReconocidos.forEach((contenedor) => {
        const grupoCodigos = contenedor.codigosUID
        grupoCodigos.forEach((codigoUTF8) => {
            const bufferFromUTF = Buffer.from(codigoUTF8, "utf8")
            const codigoB64 = bufferFromUTF.toString("base64")
            soloCodigosBase64Descunetos.push(codigoB64)
        })
    })
}