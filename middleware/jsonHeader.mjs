
export const jsonHeader = (req, res, next) => {
    if (req.method === "POST" && !req.is('application/json')) {
        return res.status(400).json({
            error: 'Se quiere la cabecera json'
        });
    }
    next();
}