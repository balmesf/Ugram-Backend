import HttpStatus from 'http-status-codes';
import cloudWatchLogs from '../services/logger/logger_messages';
import notificationService from '../services/socket/socket_service';
import newsfeed_utils from '../utils/newsfeed_utils';
import UserModel from '../models/user';
import mongoose from 'mongoose';
import utils from '../utils/utils';

const SIZE = 'medium';

//*** MODELS ***//
const PictureSchema  = new mongoose.Schema({
    userId: {
	type : String,
	index : {
	    unique: true,
	    sparse: true
	}
    },
    mentions : [],
    tags : [],
    description: String,
    url: [],
    createdDate : {type : Date, default: Date.now},
    comments : [{
	userId: {
	    type : String,
	    index : {
		unique: true,
		sparse: true
	    }
	},
	message : String,
	createdDate : Date
    }],
    likes : [{
	userId: {
    	    type : String,
    	    index : {
    		unique : true,
		sparse : true
	    }
    	},
    	date : Date
    }]
});

let Picture = mongoose.model('Picture', PictureSchema);

/** QUERY **/

let FindPictureByIdQuery = (id) => { return Picture.findOne({ '_id' : id }) };
let FindAllPicturesByUserIdQuery = (id) => { return Picture.find({ 'userId' : id }) };
let getAllPicturesQuery = (id) => { return Picture.find({}) };

/** METHODS **/

exports.getAllPicture = (req, res, done) => {
    let page = req.query.page || 1;
    let query = Picture.find({}).skip(10 * (page - 1)).limit(10)
    let sizePhoto = req.query.size || SIZE;

    query.exec((err, docs) => {
	let items = {
	    items : [],
	    totalEntries : page,
	    page : page
	}
	if (!err) {
	    let pictures = [];
	    for (let i = 0; i < docs.length; i++)
		pictures.push(utils.formatPictureByImageSize(sizePhoto, docs[i]));
	    items.items = pictures;
	    if (items.items.length !== 0 && items.items.length % 10 === 0)
		items.totalEntries = page * 10;
	    else
		items.totalEntries = (page - 1) * 10  + items.items.length;
	    return done(null , items);
	}
	else 
	    return done(err);
    });
}

exports.deletePost = (req, res, done) => {
    Picture.findOne({'_id' : req.params.picture_id }, (err, result) => {
	if (err)
	    return done(err);
	else {
	    result.remove();
	    return done(null, result);
	}
    });
}

exports.updatePost = (picture_id, body, done) => {
    FindPictureByIdQuery(picture_id).exec((err, doc) => {
	if (err)
	    return done(err);
	if (doc) {
	    doc.description = body.description;
	    doc.mentions = body.mentions;
	    doc.tags = body.tags;
	    console.log(doc);
	    doc.save((err) => {
		if (err)
		    done(err);
		return done(null, doc)
	    });
	}
	else {
	    return done(err);
	}
    });    
}

exports.deleteAllPostsByUserId = (user_id, cb) => {
    Picture.remove({ 'userId' : { '$in' : user_id }}, (err, result) => {
	if (err)
	    return cb(err);
	return cb(null, result);
    })
}

exports.findPictureById = (picture_id, sizePhoto, done) => {
    FindPictureByIdQuery(picture_id).exec((err, doc) => {
	let items = { items : [] };
	    console.log(doc);
	
        if (!err) {
	    console.log(doc);
	    items.items.push(utils.formatPictureByImageSize(sizePhoto, doc));
	    return done(null, items);
	}
        else
	    return done(err);
    });
}

exports.allPicturesByUserId = (user_id,  size, done) => {
    let sizePhoto = size || SIZE;

    FindAllPicturesByUserIdQuery(user_id).exec((err, docs) => {
	let items = { items : [] };
	if (!err) {
            let pictures = [];
            for (let i = 0; i < docs.length; i++) {
		pictures.push(utils.formatPictureByImageSize(sizePhoto, docs[i]));
            }
            items.items = pictures;
	    return done(null, items);
	}
	else
	    return done(err);
    });                                
}

exports.postImage = (req, arrayImage, done) => {
    let picture = new Picture();
    
    picture.userId = req.params.user_id;
    picture.createdDate = Date.now();
    picture.url = arrayImage.map((x) => {
	let indexes = [];
	for (let i in x.Location)
	    if (x.Location[i] === '_')
		indexes.push(i);
	return {
	    type : x.Location.substring(indexes[0], indexes[1]).substr(1),
	    url : x.Location
	}
    });
    picture.description = req.body.description || '';
    picture.tags = req.body.tags !== undefined ? req.body.tags.split(',') : [];
    picture.mentions = req.body.mentions !== undefined ? req.body.mentions.split(',') : [];
    picture.save((err) => {
	if (err)
	    return done(err);
	return done(null, { item : picture });
    });    
}

/** SEARCH **/
exports.searchByKeyword = (keyword, done) => {
    let items = {items : []}
    let regex = new RegExp(keyword, 'i');
    let sizePhoto = req.query.size || SIZE;

    Picture.find({"description" : regex }, (err, result) => {
	if (err)
	    return done(err);
	
	if (result) {
	    let pictures = [];
	    for (let i = 0; i < result.length; i++) {
		pictures.push(utils.formatPictureByImageSize(sizePhoto, result[i]));
	    }
	    items.items = pictures;
	    return done(null, items);
	}
    });
}

exports.searchByTag = (tag, done) => {
    let items = {items : []}
    let regex = new RegExp(tag, 'i');
    let sizePhoto = req.query.size || SIZE;

    Picture.find({"tags" : regex}, (err, result) => {
	if (err)
	    return done(err);
	if (result) {
	    let pictures = [];
	    for (let i = 0; i < result.length; i++) {
		pictures.push(utils.formatPictureByImageSize(sizePhoto, result[i]));
	    }
	    items.items = pictures;
	    return done(null, items);
	}
	else
	    return done(null, result);
    });    
}


exports.searchByUserId = (user, done) => {
    let items = {items : [], totalEntries : 0, totalPages : 1};
    let regex = new RegExp(user, 'i');

    User.find({ $and: [{ $or : [ {"facebook.user_id" : regex}, { "local.user_id" : regex } ]}]},  (err, users) => {
	if (!err) {
	    if (users) {
		for (let i =0; i !== users.length; i++)
		    items.items.push(utils.formatUser(users[i]));
		items.totalEntries = items.items.length;
		return (null, items);
	    }
	    else 
		return done (null, items);
	}
	else
	    return done(err);
    }); 
}

//** NEWSFEED **//

exports.getTopHashTags = (done) => {
    getAllPicturesQuery().exec((err, docs) => {
	if (err) {
	    return done (err);
	}
	if (!docs) {
	    return done(null, docs);
	}
	return done(null, newsfeed_utils.findTopHashtags(docs));
    });
}

exports.getPopularUsersAccounts = (done) => {
    getAllPicturesQuery().exec((err, docs) => {
	if (err) {
	   return done(err);
	}
	if (docs.length === 0) {
	    return done (null, docs);
	}
	const usersToFind = newsfeed_utils.findTopUserAccounts(docs);
	var items = {items : [], totalEntries : 0};
	UserModel.findUsersByIdQuery(usersToFind).exec((err, users) => {
	    if (err) {
		cloudWatchLogs.LogMongoError(err);
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({message: err});
	    }
	    if (users) {
		for (var i in users) {
		    if (users.hasOwnProperty(i))
			items.items.push(utils.formatUser(users[i]));
		}
	    }
	    items.totalEntries = items.items.length;
	    return done(null, items)
	});
    });
    
}

exports.getRecommandedUsersAccounts = (userId, done) =>  {
    const items = {items : [], totalEntries : 0};

    getAllPicturesQuery().exec((err, docs) => {
	if (err)
	    return done(err);

	const usersToFind = newsfeed_utils.findRecommendedAccounts(userId, docs).map((x) => {return x.userId});
	UserModel.findUsersByIdQuery(usersToFind).exec((err, users) => {
	    if (err)
		return done(err);
	    if (users) {
		for (var i in users)
		    items.items.push(utils.formatUser(users[i]));
	    }
	    items.totalEntries = items.items.length;
	    return done(null, items);
	});
    })
}

//*** COMMENTS ***//

exports.postComment = (pictureId, userId, message, done) => {
    Picture.findOne({ '_id' : pictureId }, (err, doc) =>{
	if (err)
	    return done(err);
	else {
	    doc.comments.push({
		userId : userId,
		message : message,
		createdDate : Date.now()
	    });
	    doc.save((err) => {
		if (err)
		    return done(err);

		if (doc.userId === req.params.user_id) {
		    return done(null, doc);
		    res.status(HttpStatus.CREATED).send(doc);
		}
		else {
		    notificationService.sendNotification({
			userId : req.params.user_id,
			type : 'COMMENT',
			message : ' leaves a comment on your post.',
			pictureOwner : doc.userId,
			pictureUrl : doc.url[0].url
		    }, (err, result) => {
			if (err)
			    return done(err);
			return done(null, doc);
		    })
		}
	    });
	}
    });
}

exports.updateComment = (pictureId, done) => {
    Picture.findOne({ '_id' : pictureId }, (err, doc) =>{
	if (err)
	    return done(err);
	else {
	    let com = doc.comments.find(o => o._id === req.params.comment_id);
	    let index = doc.comments.indexOf(com);
	    
	    doc.comments[index].message = req.body.message;
	    doc.save();
	    return done(null, doc);
	}
    });
}


exports.getComments = (pictureId, done) => {
    Picture.findOne({ '_id' : pictureId }, (err, doc) =>{
	if (err)
	    return done(err);
	else
	    return done(null, doc.comments);
    });
}

exports.deleteComment = (pictureId, commentId, done) => {
    Picture.findOne({ '_id' : pictureId }, (err, doc) =>{
	if (err)
	    return done(err);
	else {
	    let com = doc.comments.find(o => o._id === commentId);
	    let index = doc.comments.indexOf(com);

	    if (index > -1)
		doc.comments.splice(index, 1);
	    doc.save();
	    return done(null, doc);
	}
    });
}

//*** LIKES ***//

exports.getLikes = (pictureId, done) => {
    Picture.findOne({ '_id' : pictureId }, (err, doc) =>{
	if (err)
	    return done(err);
	else
	    return done(null, doc.likes);
    });
}

exports.postLike = (pictureId, userId, done) => {
    Picture.findOne({ '_id' : pictureId }, (err, doc) =>{
	if (err)
	    return done(err);
	else {
	    let hasLike = doc.likes.find(o => o.userId === userId);
	    if (!hasLike) {
		doc.likes.push({
		    userId : userId,
		    date : Date.now()
		});
		doc.save((err) => {
		    if (err)
			return done(err);

		    if (doc.userId === userId)
			return done(null, doc);
		    else {
			notificationService.sendNotification({
			    userId : userId,
			    type : 'LIKE',
			    message : ' likes your post.',
			    pictureOwner : doc.userId,
			    pictureUrl : doc.url[0].url
			}, (err, result) => {
			    if (err)
				return done(err);
			    return done(null, doc);
			});
		    }
		});
	    }
	    return done(null, doc);
	}
    });
    
}

exports.deleteLike = (pictureId, userId, done) => {
    Picture.findOne({ '_id' : pictureId }, (err, doc) =>{
	if (err)
	    return done(err);
	else {
	    let like = doc.likes.find(o => o.userId === userId);
	    let index = doc.likes.indexOf(like);

	    if (index > -1)
		doc.likes.splice(index, 1);
	    doc.save();
	    return done(null, doc);
	}
    });
}

//** EXPORTS **//

exports.schema = PictureSchema;
exports.model = Picture;
