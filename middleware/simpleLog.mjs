export const simpleLog = (req, res, next) => {
    const logO = {
        date: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        headers: JSON.stringify(req.headers)
    }
    next();
};