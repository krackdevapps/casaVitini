export class VitiniIDX {
    constructor(session, salida) {
        this.usuario = session.usuario;
        this.rol = session.rol;
        this.salida = salida
        this.contenedorGrupos = [];
    }
    administradores() {
        this.contenedorGrupos.push("administrador");
    }

    empleados() {
        this.contenedorGrupos.push("empleado");
    }

    clientes() {
        this.contenedorGrupos.push("cliente");
    }

    control() {
        try {
            const VitiniIDX = this.usuario;
            console.log("viti", VitiniIDX)
            if (!VitiniIDX) {
                const sysError = new Error("Mensaje de error")
                const msgError = {
                    tipo: "IDX",
                    mensaje: "Tienes que identificarte para seguir"
                };
                const constructor = Object.assign(sysError, msgError)
                throw constructor
            }
            console.log("jis", this.contenedorGrupos)
            if (this.contenedorGrupos.length > 0) {
                console.log("mayorcero", this.contenedorGrupos.length)

                const rol = this.rol;
                console.log("rol", rol)
                if (!this.contenedorGrupos.includes(rol)) {
                    const sysError = new Error("Mensaje de error")
                    const msgError = {
                        tipo: "ROL",
                        mensaje: "No estás autorizado, necesitas una cuenta de más autoridad para acceder aquí"
                    };
                    const constructor = Object.assign(sysError, msgError)
                    throw constructor
                }
            }
            return false
        } catch (errorCapturado) {
            this.salida.json(errorCapturado)
            return true
        }
    }
}