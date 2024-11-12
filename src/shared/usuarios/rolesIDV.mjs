export const rolesIDV = (data) => {
    try {
        const roles = {
            administrador: "Administrador",
            empleado: "Empleado",
            cliente: "Cliente"
        }
        const operacion = data.operacion
        if (operacion === "validar") {
            const rolIDV = data.rolIDV
           if (!Object.keys(roles).includes(rolIDV)) {
                const m = "No se reconoce el rolIDV, solo se esperan roles como administrador, empleado, cliente"
                throw new Error(m)

           }
            return {
                rolIDV,
                rolUI: roles[rolIDV]
            }
        } else if (operacion === "enumerar") {
            return roles
        } else {
            const m = "rolesIDV no reconocoe la operacion solicitada"
            throw new Error(m)
        }
    } catch (error) {
        throw error
    }


}