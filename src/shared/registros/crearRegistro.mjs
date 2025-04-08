import { DateTime } from "luxon"
import { insertarRegistro } from "../../infraestructure/repository/registro/insertarRegistro.mjs"

export const crearRegistro = async (data) => {
    const registroUI = data.registroUI
    const entrada = data.entrada

    const usuario = entrada?.session?.usuario || "_invitado_"
    const ip = entrada.socket?.remoteAddress;
    const userAgent = entrada.get('User-Agent');
    const fecha = DateTime.now().toUTC().toISO()

    const tamañoMaximo = 500;
    const limpiarObjeto = (objeto) => {
        const objetoLimpio = Object.create(null);
        for (const [clave, valor] of Object.entries(objeto)) {
            if (typeof valor === 'string' && valor.length > tamañoMaximo) {
                continue;
            }
            objetoLimpio[clave] = valor;
        }
        return objetoLimpio;
    }

    // await insertarRegistro({
    //     registroUI: limpiarObjeto(registroUI),
    //     usuario,
    //     ip,
    //     userAgent,
    //     fecha
    // })
}