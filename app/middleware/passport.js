import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import { model as User } from '../models/user';
import { schema as UserSchema } from '../models/user';
import HttpStatus from 'http-status-codes';
import jwt from 'jwt-simple';
import moment from 'moment';
import formatUser from '../utils/utils';
import cloudWatchLogs from '../services/logger/logger_messages';

module.exports = (passport) => {
    
    let createJWT = (user) => {
	let payload = {};
	if (user.local === undefined && user.facebook === undefined)
	    payload = {
		user : user,
		iat: moment().unix(),
		exp: moment().add(14, 'days').unix()
	    };
	else
	    payload = {
		user : user.local.user_id || user.facebook.user_id,
		iat: moment().unix(),
		exp: moment().add(14, 'days').unix()
	    };
	return jwt.encode(payload, process.env.TOKEN_SECRET);
    }
    
    //** FACEBOOK SIGNUP **//
    passport.use('facebook', new FacebookStrategy({
	clientID: process.env.APP_ID,
	clientSecret:  process.env.APP_SECRET,
	callbackURL: process.env.CALLBACK_URL,
	profileFields: ['id', 'name', 'displayName', 'photos', 'hometown', 'email', 'profileUrl', 'friends']
    },(accessToken, refreshToken, profile, cb) => {
	
	process.nextTick(() => {
	    User.findOne({ 'facebook.id' : profile.id }, (err, user) => {
		if (err)
		    return cb(null, err);
		else {
		    if (user) {
			user.access_token = accessToken;
			user.save();
			return cb(null, user);
		    }
		    else {
			let newUser = new User();

			newUser.facebook.id  = profile.id;
			newUser.facebook.user_id = profile.name.givenName + '_' + profile.name.familyName;
			newUser.facebook.firstname  = profile.name.givenName;
			newUser.facebook.lastname = profile.name.familyName;
			newUser.url = [
			    { type : 'small', url : profile.photos[0].value },
			    { type : 'medium', url : profile.photos[0].value },
			    { type : 'large', url : profile.photos[0].value }
			];
			newUser.facebook.access_token = accessToken;
			newUser.registrationDate = Date.now();
			if (profile.emails !== undefined)
			    newUser.facebook.email = profile.emails[0].value;
			newUser.save((err) => {
			    if (err) {
				cloudWatchLogs.LogMongoError(err);
				return cb(err);
			    }
			    cloudWatchLogs.LogSuccessfullAuth();
			    return cb(null, formatUser.formatUserForAuthentication(newUser));
			});
		    }
		}
	    });
	});
    }));

    //** LOCAL SIGNUP **//
    passport.use('local-signup', new LocalStrategy({
	usernamelField : 'username',
	passwordField : 'password',
	passReqToCallback : true
    },( req, username, password, done) => {
	process.nextTick(() => {
	    
	    User.findOne({ 'local.user_id' :  username }, (err, user) => {
	    	if (err)
		    return done(err);
		
		if (user)
		    return done(err);

	    	else {
		    let newUser = new User();
		    let token = createJWT(username, process.env.TOKEN_SECRET);
		    newUser.local.user_id = req.body.username;
		    newUser.local.lastname = req.body.lastname;
		    newUser.local.firstname = req.body.firstname;
		    newUser.local.email = req.body.email;
		    newUser.local.phoneNumber = req.body.phone;
		    newUser.local.password = UserSchema.methods.generateHash(req.body.password);
		    newUser.local.access_token = token;
		    newUser.url = [];
		    newUser.registrationDate = Date.now();
		    newUser.save((err) => {
			if (err) {
			    cloudWatchLogs.LogMongoError(err);
			    return done(err);
			}
			cloudWatchLogs.LogSuccessfullAuth('Ugram');
			return done(null, formatUser.formatUserForAuthentication(newUser));
		    });
		}
	    });
	});
    }));
    
    //** LOGIN LOCAL **/
    passport.use('local-login', new LocalStrategy({
	usernamelField : 'username',
	passwordField : 'password',
	passReqToCallback : true
    },( req, username, password, done) => {

	process.nextTick(() => {
	    User.findOne({ 'local.user_id' :  username }, (err, user) => {
		if (err)
		    return done(err);
		
		if (!user || user.length === 0)
		    return done(null, false);

    		if (!UserSchema.methods.verifyPassword(password, user.local.password))
  		    return done(null, HttpStatus.UNAUTHORIZED);
		
		let token = createJWT(user, process.env.TOKEN_SECRET);
		user.access_token = token;
		user.save((err) => {
		    if (err) {
			cloudWatchLogs.LogMongoError(err);
			return done(err);
		    }
		    cloudWatchLogs.LogSuccessfullAuth('Ugram');
		    return done(null, formatUser.formatUserForAuthentication(user));
		});
	    });
	});
    }));

}
