import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import formatUser from '../utils/utils';
import pictureModel from '../models/picture';
import cloudWatchLogs from '../services/logger/logger';

//*** MODELS ***//

let UserSchema  = new mongoose.Schema({
    local : {
    	user_id: {
	    type : String,
	    index : {
		unique: true,
		sparse: true
	    }
	},
    	firstname: String,
    	lastname: String,
	access_token : String,
    	phoneNumber: String,
    	email: String,
    	password: String
    },
    facebook : {
	user_id: {
	    type : String,
	    index : {
		unique: true,
		sparse: true
	    }
	},
    	firstname: String,
    	lastname: String,
	access_token : String,
    	email: String,
	phoneNumber: String
    },
    registrationDate: {type : Date, default: Date.now},
    url: []
});

let User = mongoose.model('User', UserSchema);

/** QUERY **/

let findUserByIdQuery = (id) => {
    return User.findOne({ $and: [{ $or : [ {"facebook.user_id" : id}, { "local.user_id" : id } ]}]})
};

let findUsersByIdQuery = (id) => {
    return User.find({ $and: [{ $or : [ {"facebook.user_id" : id}, { "local.user_id" : id } ]}]})
};

let findUserByTokenQuery = (token) => {
    return User.findOne({ $and: [{ $or : [ {"facebook.access_token" : token}, { "local.access_token" : token } ]}]})
};

// PASSWORD
UserSchema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.verifyPassword = (enteredPassword, password) => {
    return bcrypt.compareSync(enteredPassword, password);
};

/** METHODS **/

exports.findByUserId = (user_id, sizeImage, done) => {
    findUserByIdQuery(user_id).exec((err, user) => {
	if (!err) {
	    if (user)
		return done(null, formatUser.formatUser(user, sizeImage));
	    else
		return done (err);
	}
	else
	    return done(err);
    });
}

exports.deleteUserById = (user_id, done) => {
    findUserByIdQuery(user_id).exec((err, result) => {
	if (result === null)
	    return done(err);
	if (err)
	    return done(err);
	 else
	     pictureModel.deleteAllPostsByUserId(user_id, (err, data) => {
	         if (err)
		     return done(err);
		 result.remove();
		 done(null, result);
	     });
    });         
}

exports.getAllUsers = (page, sizeImage, done) => {
    let query = User.find({}).skip(10 * (page - 1)).limit(10)

    query.exec((err, docs) => {
	var items = {items : [], totalEntries : 0, page : page};
	if (!err) {
	    if (docs.length > 0) {
		for (var i = 0; i < docs.length; i++)
		    items.items.push(formatUser.formatUser(docs[i], sizeImage));
	    }
	    if ((items.items.length % 10) === 0)
		items.totalEntries = page * 10;
	    else
		items.totalEntries = (page - 1) * 10  + items.items.length;
	    done(null, items);
	}
	else
	    return done(err);
    });
}

exports.SignUpWithFacebook = (profile, done) => {
    User.findOne({'facebook.user_id' : profile.userId}, (err, user) => {
	if (err)
	    return done(err);
	else {
            if (user) {
		user.access_token = profile.accessToken;
		user.save();
		done(null, formatUser.formatUserForAuthentication(user));
            }
            else {
		let newUser = new User();
		
		newUser.facebook.user_id = profile.firstName + '_' + profile.lastName
		newUser.facebook.firstname  = profile.firstName,
		newUser.facebook.lastname = profile.lastName,
		newUser.url = [
                    { type : 'small', url : profile.picture },
                    { type : 'medium', url : profile.picture },
                    { type : 'large', url : profile.picture }
		];
		newUser.facebook.access_token = profile.accessToken;
		newUser.registrationDate = Date.now();
		newUser.facebook.email = profile.email;
		console.log(newUser);
		newUser.save((err) => {
                    if (err)
			return done(err);
		    done(null, formatUser.formatUserForAuthentication(newUser));
		});
            }
	}
    });  
}

exports.uploadAvatar = (user_id, arrayImage, done) => {
    findUserByIdQuery(user_id).exec((err, user) => {
	if (err)
	    return done (err);
	user.url = arrayImage.map((x) => {
	    let indexes = [];
	    for (var i in x.Location)
		if (x.Location[i] === '_')
		    indexes.push(i);
	    return {
		type : x.Location.substring(indexes[0], indexes[1]).substr(1),
		url : x.Location
	    }
	});
	user.save((err) => {
	    if (err)
		return done(err);
	    return done(null, { item : user });
	});
    });    
}

exports.updateUser = (user_id, body, done) => {
    findUserByIdQuery(user_id).exec((err, doc) => {
	if (err)
	    return done(err);
	if (doc) {
	    if (doc.local.user_id) {
		doc.local.email = body.email || doc.local.email;
		doc.local.firstname = body.firstName || doc.local.firstname;
		doc.local.lastname = body.lastName || doc.local.lastname;
		doc.local.phoneNumber = body.phoneNumber || doc.local.phoneNumber;
		doc.save((err) => {
		    if (err)
			return done(err);
		    return done(null,formatUser.formatUser(doc));
		});
	    }
	    
	    else {
		doc.facebook.email = body.email || doc.facebook.email;
		doc.facebook.firstname = body.firstName || doc.facebook.firstname;
		doc.facebook.lastname = body.lastName || doc.facebook.lastname;
		doc.facebook.phoneNumber = body.phoneNumber || doc.facebook.phoneNumber;
		doc.save((err) => {
		    if (err)
			return done(err);
		    return done(null,formatUser.formatUser(doc));
		    
		});
	    }
	}
    });
}
//** EXPORTS **//	
exports.schema = UserSchema;
exports.model = User;
exports.findUsersByIdQuery = findUsersByIdQuery;
exports.findUserByTokenQuery = findUserByTokenQuery;
