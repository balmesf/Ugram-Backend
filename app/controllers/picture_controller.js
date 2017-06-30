import HttpStatus from 'http-status-codes';
import AWS from 'aws-sdk';
import async from 'async';
import { model as Picture } from '../models/picture';
import PictureModel from '../models/picture';
import AuthMiddleware from '../middleware/authentication';
import processing from '../utils/image_processing';
import cloudWatchLogs from '../services/logger/logger_messages';
import utils from '../utils/utils';

const TYPE = 'pictures';
const SIZE = 'medium';
const PATH = 'uploads/posts/';

exports.addPost = (req, res) => {
    AuthMiddleware.isAuthenticated(req, res, ()  => {
	const upload = (data, cb) => {
	    var file = data;
	    var uploadParams = {
	    	Bucket: process.env.BUCKET_NAME,
	    	Key: PATH + file.dstPath,
	    	Body: file.srcData
	    };
	    global.S3.upload(uploadParams, (err, result) => {
		if (err) {
		    cloudWatchLogs.LogConflictLog(err);
		    res.status(HttpStatus.CONFLICT).send({message: err});
		}
		cloudWatchLogs.LogSuccessfullS3Upload();		    
		cb(null, result);
	    });
	}

	processing.getProcessedImages(req, res, req.file, (err, data) => {
	    if (err)
	    	res.status(err.code).send({message: err.message});
	    
	    async.map(data, upload, (err, arrayImage) => {
	    	if (err) {
		    cloudWatchLogs.LogConflictLog(err);
		    res.status(HttpStatus.CONFLICT).send({message: err});
		}
		PictureModel.postImage(req, arrayImage, (err, doc) => {
		    if (err) {
			cloudWatchLogs.LogMongoError(err);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
		    }
		    else {
			cloudWatchLogs.LogSuccessfullPost(TYPE);
			res.status(HttpStatus.OK).send(doc);
		    }	
		});
	    });
	});
    });
};

exports.deletePost = (req, res) => {
    PictureModel.deletePost(req, res, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else {
    	    cloudWatchLogs.LogSuccessfullDelete(TYPE);
    	    res.status(HttpStatus.ACCEPTED).send(doc);
	}
    });
}

exports.updatePost = (req, res) => {
    PictureModel.updatePost(req.params.picture_id, req.body,(err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else {
	    cloudWatchLogs.LogSuccessfullUpdate(TYPE);
    	    res.status(HttpStatus.OK).send(doc);
	}	    
    });
}

exports.allPictures = (req, res) => {
    PictureModel.getAllPicture(req, res, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else {
	    cloudWatchLogs.LogSuccessfullGet(TYPE);
	    res.status(HttpStatus.OK).send(doc);
	}	
    });
};

exports.findPictureById = (req, res) => {
    PictureModel.findPictureById(req.params.picture_id, req.query.size,(err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else {
	    cloudWatchLogs.LogSuccessfullGet(TYPE);
    	    res.status(HttpStatus.OK).send(doc);
	}	    
    });
}

exports.allPicturesByUserId = (req, res) => {
    PictureModel.allPicturesByUserId( req.params.user_id, req.query.size, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else {
	    cloudWatchLogs.LogSuccessfullGet(TYPE);
    	    res.status(HttpStatus.OK).send(doc);
	}	    
    });
};
