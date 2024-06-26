
export const jsonHeader = (req, res, next) => {
    const headers = req.headers;

    // if (!req.is('application/json')) {
    //     return res.status(400).json({ error: 'Se quiere la cabecera json' });
    // }
    next();


}