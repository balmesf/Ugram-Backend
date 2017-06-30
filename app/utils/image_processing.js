import HttpStatus from 'http-status-codes';
import sharp from 'sharp';
import multer from 'multer';
import AWS from 'aws-sdk';
import async from 'async';

let SIZE = 'medium';

let upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 32 * 1000 * 1000  }
});

exports.upload = upload;

exports.getProcessedImages = (req, res, image, done) => {

    let imagesProcessed = [];
    let smallImage = {
	type : 'small',
    	width: 256,
    	height: 256,
    	srcData: undefined,
    	dstPath: Date.now().toString() + '_small_' + image.originalname
    };

    let mediumImage = {
	type : 'medium',
    	width: 512,
    	height: 512,
    	srcData: undefined,
    	dstPath: Date.now().toString() + '_medium_' + image.originalname
    };

    let largeImage = {
	type : 'large',
    	width: 1024,
    	height: 1024,
    	srcData: undefined,
    	dstPath: Date.now().toString() + '_large_' + image.originalname
    };

    sharp(image.buffer).resize(largeImage.width, largeImage.height).max().toBuffer().then((dataLarge) => {
	largeImage.srcData = dataLarge;
	sharp(image.buffer).resize(mediumImage.width, mediumImage.height).max().toBuffer().then((dataMedium) => {
	    mediumImage.srcData = dataMedium;
	    sharp(image.buffer).resize(smallImage.width, smallImage.height).max().toBuffer().then((dataSmall) => {
		smallImage.srcData = dataSmall;
		imagesProcessed.push(smallImage, mediumImage, largeImage);
		done(null, imagesProcessed);
	    }).catch( err => done({code : HttpStatus.CONFLICT , message: err}));
	}).catch( err => done({code : HttpStatus.CONFLICT , message: err}));
    }).catch( err => done({code : HttpStatus.CONFLICT , message: err}));
}
