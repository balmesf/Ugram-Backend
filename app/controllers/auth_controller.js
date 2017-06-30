import HttpStatus from 'http-status-codes';
import cloudWatchLogs from '../services/logger/logger_messages';
import UserModel from'../models/user';
import { model as User } from '../models/user';

const TYPE = 'token';

exports.removeToken = (req, res, done) => {
    const token = req.header('Authorization');
    
    UserModel.findUserByTokenQuery(token).exec((err, user) => {
	if (err) {
    	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
    	}
	if (user === null) {
	    cloudWatchLogs.LogNotFoundError(err);
            return res.status(HttpStatus.NOT_FOUND).send({message: 'Token no longer valid'});
	}
 	let profile = new User();
	
	profile = user;
	if (profile.access_token)
	       profile.access_token = '';
	
	profile.save((err, result) => {
	    if (err) {
		cloudWatchLogs.LogMongoError(err);
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	    }
	    
	    cloudWatchLogs.LogSuccessfullDelete(TYPE);
	    return done(result);
	});
    });
}
