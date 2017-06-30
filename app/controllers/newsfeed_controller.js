import HttpStatus from 'http-status-codes';
import PictureModel from '../models/picture';
import UserModel from '../models/user';
import newsfeed_utils from '../utils/newsfeed_utils';
import cloudWatchLogs from '../services/logger/logger_messages';
import utils from '../utils/utils';

const TYPE = 'accounts';

exports.getTopHashTags = (req, res) => {
    PictureModel.getTopHashTags((err, docs) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	if (!docs) {
	    cloudWatchLogs.LogSuccessfullGet('tags');
	    res.status(HttpStatus.OK).send(docs);
	}
	cloudWatchLogs.LogSuccessfullGet('tags');
	res.status(HttpStatus.OK).send(docs);
    });
}


exports.getPopularUsersAccounts = (req, res) =>  {
    PictureModel.getPopularUsersAccounts((err, docs) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	if (!docs) {
	    cloudWatchLogs.LogSuccessfullGet(TYPE);
	    res.status(HttpStatus.OK).send(docs);
	}
	cloudWatchLogs.LogSuccessfullGet(TYPE);
	res.status(HttpStatus.OK).send(docs);
    });
}

exports.getRecommandedUsersAccounts = (req, res) =>  {
    PictureModel.getRecommandedUsersAccounts(req.query.user_id, (err, docs) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	if (!docs) {
	    cloudWatchLogs.LogSuccessfullGet(TYPE);
	    res.status(HttpStatus.OK).send(docs);
	}
	cloudWatchLogs.LogSuccessfullGet(TYPE);
	res.status(HttpStatus.OK).send(docs);
    });
}
