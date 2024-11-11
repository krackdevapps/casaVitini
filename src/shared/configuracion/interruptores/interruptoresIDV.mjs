export const interruptoresIDV = (data) => {
    try {
        const interruptores = [
            "aceptarReservasPublicas"
        ]
        if (!interruptores.includes(data)) {
            const m = "No existe el identificador del interruptr"
            throw new Error(m)
        }

    } catch (error) {
        throw error
    }
}