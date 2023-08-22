const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, splat } = format;

const myFormat = printf((info) => {
  if (info.meta && info.meta instanceof Error) {
    return `${info.timestamp} ${info.message} ${info.meta.stack}`;
  }
  return `${info.timestamp} : ${info.message}`;
});

const Logger = createLogger({
  transports: [
    new (transports.File)(
      {
        filename:'error.log',
        level: 'error',
        format: combine(
          colorize(),
          timestamp(),
          splat(),
          myFormat
        )
      }
    )
  ]
});

module.exports = Logger