import HttpStatus from 'http-status-codes';
import { model as Picture } from '../models/picture';
import PictureModel from '../models/picture';
import utils from '../utils/utils';
import notificationService from '../services/socket/socket_service';
import cloudWatchLogs from '../services/logger/logger_messages';

const TYPE_COMMENT = 'comment';
const TYPE_LIKE = 'like';

//** COMMENTS **//

exports.postComment = (req, res) => {
    PictureModel.postComment(req.params.picture_id, req.params.user_id, req.body.message, (err, docs) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	cloudWatchLogs.LogSuccessfullPost(TYPE_COMMENT);
        res.status(HttpStatus.CREATED).send(doc);
    });
}

exports.updateComment = (req, res) => {
    PictureModel.updateComment(req.params.picture_id, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	cloudWatchLogs.LogSuccessfullUpdate(TYPE_COMMENT);
	res.status(HttpStatus.OK).send(doc);
    });
}

exports.getComments = (req, res) => {
    PictureModel.getComments(req.params.picture_id, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	cloudWatchLogs.LogSuccessfullUpdate(TYPE_COMMENT);
	res.status(HttpStatus.OK).send(doc);
    });
}

exports.deleteComment = (req, res) => {
    PictureModel.deletComment(req.params.picture_id, req.params.comment_id, (err, doc) => {
	if (err) {
            cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
    	    cloudWatchLogs.LogSuccessfullDelete(TYPE_COMMENT);
    	    res.status(HttpStatus.ACCEPTED).send(doc);
    });
}


//** LIKES **//

exports.getLikes = (req, res) => {
    PictureModel.getLikes(req.params.picture_id, (err, doc) => {
	if (err) {
            cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	else {
	    cloudWatchLogs.LogSuccessfullGet(TYPE_LIKE);
	    res.status(HttpStatus.OK).send(doc);
	}
    });
}

exports.postLike = (req, res) => {
    PictureModel.postLike(req.params.picture_id, req.params.user_id, (err, doc) => {
	if (err) {
	    cloudWatchLogs.LogMongoError(err);
	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
	cloudWatchLogs.LogSuccessfullPost(TYPE_LIKE);
        res.status(HttpStatus.CREATED).send(doc);
    });
}

exports.deleteLike = (req, res) => {
    PictureModel.deleteLike(req.params.picture_id, req.params.user_id, (err, doc) => {
	if (err) {
            cloudWatchLogs.LogMongoError(err);
    	    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	}
    	cloudWatchLogs.LogSuccessfullDelete(TYPE_LIKE);
    	res.status(HttpStatus.ACCEPTED).send(doc);
    });
}
