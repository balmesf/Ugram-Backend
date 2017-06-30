import HttpStatus from 'http-status-codes';
import { model as User } from '../models/user.js';
import { model as Picture } from '../models/picture.js';
import PictureModel from '../models/picture';
import cloudWatchLogs from '../services/logger/logger_messages';
import utils from '../utils/utils';

const TYPE_PICTURES = 'pictures';
const TYPE_ACCOUNTS = 'accounts';
const SIZE = 'medium';

exports.searchByKeyword = (req, res) => {
    PictureModel.searchByKeyword = (req.params.key, (err, doc) => {
	if (err) {
    	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
    	}
	else {
    	    cloudWatchLogs.LogSuccessfullGet(TYPE_PICTURES);
    	    res.status(HttpStatus.OK).send(doc);
	}
    });
};

exports.searchByTag = (req, res) => {
    PictureModel.searchByTag = (req.params.tag, (err, doc) => {
	if (err) {
    	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
    	}
	else {
    	    cloudWatchLogs.LogSuccessfullGet(TYPE_PICTURES);
    	    res.status(HttpStatus.OK).send(doc);
	}
    });
};

exports.searchByUserId = (req, res) =>  {
    PictureModel.searchByUserId = (req.params.user, (err, doc) => {
	if (err) {
    	    cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
    	}
	else {
    	    cloudWatchLogs.LogSuccessfullGet(TYPE_PICTURES);
    	    res.status(HttpStatus.OK).send(doc);
	}
    });
}
