import HttpStatus from 'http-status-codes';
import { model as User } from '../models/user.js';
import jwt from 'jwt-simple';
import moment from 'moment';
import cloudWatchLogs from '../services/logger/logger_messages';

const TYPE = 'token';

exports.isAuthenticated = (req, res, next) => {
    if (!req.header('Authorization'))  {
	cloudWatchLogs.LogForbiddenError();
	return res.status(HttpStatus.UNAUTHORIZED).send({message: 'Token Authorization is required.'});
    }
    let token = req.header('Authorization');
    let payload = null;

    User.findOne({ $and: [{ $or : [ {"facebook.access_token" : token}, { "local.access_token" : token } ]}]}, (err, user) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	if (user !== null) {
	    if(user.local.access_token !== undefined || user.facebook.access_token !== undefined) {
		if (user.local.access_token !== undefined) {
		    try {
			payload = jwt.decode(token, process.env.TOKEN_SECRET);
		    }
		    catch (e) {
			cloudWatchLogs.LogUnauthorizedError(e.message);
			return res.status(HttpStatus.UNAUTHORIZED).send({ message: e.message });
		    }

		    if (payload.exp <= moment().unix()) {
			cloudWatchLogs.LogUnauthroizedError(err);
			return res.status(HttpStatus.UNAUTHORIZED).send({ message: 'Token has expired.' });
		    }
		    req.user = payload.user_id;
		    return next();
		}
		else
		    return next();
	    }
	}
	else {
	    cloudWatchLogs.LogUnauthorizedError(err);
	    res.status(HttpStatus.UNAUTHORIZED).send({ message: 'Token has expired.' });
	}
    });
}
