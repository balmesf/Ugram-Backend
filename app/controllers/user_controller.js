import async from 'async';
import AWS from 'aws-sdk';
import HttpStatus from 'http-status-codes';
import AuthMiddleware from '../middleware/authentication';
import pictureController from './picture_controller';
import { model as User } from '../models/user.js';
import { schema as UserSchema } from '../models/user';
import UserModel from '../models/user';
import processing from '../utils/image_processing';
import cloudWatchLogs from '../services/logger/logger_messages';

const TYPE = 'users';
const PATH = 'uploads/profiles/';


exports.updateUser = (req, res) => {
    let user_id = req.params.user_id;

    UserModel.updateUser(user_id, req.body, (err, doc) => {
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


exports.uploadAvatar = (req, res) => {
    AuthMiddleware.isAuthenticated(req, res, ()  => {
	let user_id = req.query.user_id;
	AWS.config.update({
	    accessKeyId: process.env.ACCESS_ID,
	    secretAccessKey: process.env.SECRET_ACCESS_KEY,
	    subRegion : process.env.REGION
	});

	let s3 = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' });
	
	let upload = (data, cb) => {
	    let file = data;
	    let uploadParams = {
		Bucket: process.env.BUCKET_NAME,
		Key: PATH + file.dstPath,
		Body: file.srcData
	    };
	    s3.upload(uploadParams, (err, result) => {
		if (err) {
		    cloudWatchLogs.LogConflictLog(err);
		    res.status(HttpStatus.CONFLICT).send({message: err});
		}
		cb(null, result);
	    });
	}
	
	processing.getProcessedImages(req, res, req.file, (err, data) => {
	    if (err) {
		cloudWatchLogs.LogMongoError(err);
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	    }
	    async.map(data, upload, (err, arrayImage) => {
		if (err)
		    res.status(HttpStatus.CONFLICT).send({message: err});

		UserModel.uploadAvatar(user_id, arrayImage, (err, doc) => {
		    if (err) {
			cloudWatchLogs.LogMongoError(err);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
		    }
		    else {
			cloudWatchLogs.LogSuccessfullPost(TYPE);
		    	res.status(HttpStatus.CREATED).send({ item : doc });

		    }		    
		});
	    });
	});
    });
}

exports.deleteUser = (req, res) => {
    let user_id = req.params.user_id;
    
    UserModel.deleteUserById(user_id, (err, doc) => {
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

exports.SignUpWithFacebook = (req, res) => {
    let profile = req.body;

    UserModel.SignUpWithFacebook(profile, (err, doc) => {
	if (err) {
    	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
    	}
	else {
            cloudWatchLogs.LogSuccessfullAuth();
    	    res.status(HttpStatus.CREATED).send(doc);
	}
    });
}

exports.allUsers = (req, res) => {
    let page = req.query.page || 1;
    let sizeImage = req.query.size;
    
    UserModel.getAllUsers(page, sizeImage, (err, doc) => {
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

exports.findUserByUserId = (req, res) => {
    let user_id = req.params.user_id;
    let sizeImage = req.query.size || 'medium';
    
    UserModel.findByUserId(user_id, sizeImage, (err, doc) => {
    	if (err) {
    	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_xSERVER_ERROR).send({message: err});
    	}
	else {
	    console.log(doc);
	    cloudWatchLogs.LogSuccessfullGet(TYPE);
    	    res.status(HttpStatus.OK).send(doc);
	}
    });
};
