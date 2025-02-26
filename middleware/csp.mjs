import helmet from "helmet";

export const csp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    frameSrc: ["'self'", 'https://www.google.com'],
    workerSrc: ["'self'", "'unsafe-inline'",  'blob:']
  }
})