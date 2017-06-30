import CloudWatchTransport from 'winston-aws-cloudwatch';
import winston from 'winston';

let logger = new winston.Logger({
    transports: [
	    new (winston.transports.Console)({
	        timestamp: true,
	        colorize: true
	    })
    ]
});

let config = {
    logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
    logStreamName: process.env.NODE_ENV,
    createLogGroup: true,
    createLogStream: true,
    awsConfig: {
        accessKeyId: process.env.CLOUDWATCH_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
        region: process.env.CLOUDWATCH_REGION
    },
    formatLog : (item) => {
	return item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
    }
}

logger.add(CloudWatchTransport, config);
logger.level = 'silly';
logger.stream = { write : (message, encoding) => logger.info(message) };

module.exports = logger;
