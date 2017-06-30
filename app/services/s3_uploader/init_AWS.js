import AWS from 'aws-sdk';

exports.initAWS = () => {
    AWS.config.update({
	accessKeyId: process.env.ACCESS_ID,
	secretAccessKey: process.env.SECRET_ACCESS_KEY,
	subRegion : process.env.REGION
    });

    let s3 = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' });
    global.S3 = s3;
}
