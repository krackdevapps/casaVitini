import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs";

export const constructorOrderBy = async (nombreColumna, sentidoColumna) => {

    if (!nombreColumna) {
        return ""
    }

    const columnasVirtuales = [
        'nombreCompleto',
        'pasaporteTitular',
        'mailTitular'
    ];


    if (!columnasVirtuales.includes(nombreColumna)) {
        await validadoresCompartidos.baseDeDatos.validarNombreColumna({
            nombreColumna: nombreColumna,
            tabla: "reservas"
        })
    }

    const sentidoColumnaSQL = (sentidoColumna) => {
        if (sentidoColumna === "ascendente") {
            return "ASC";
        } else if (sentidoColumna === "descendente") {
            return "DESC";
        } else {
            return ""
        }
    }

    const nombreColumnaSQL = (nombreColumna) => {
        if (!nombreColumna || nombreColumna === "") {
            return "";
        } else {
            return nombreColumna
        }
    }
    const sentidoColumnaSQL_ = sentidoColumnaSQL(sentidoColumna)
    const nombreColumnaSQL_ = nombreColumnaSQL(nombreColumna)

    if (nombreColumnaSQL_ && sentidoColumnaSQL_) {
        const inyector = `
        ORDER BY
        "${nombreColumnaSQL_}" ${sentidoColumnaSQL_}
        `
        return inyector
    } else {
        return ""
    }
}