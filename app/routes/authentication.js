import HttpStatus from 'http-status-codes';
import AuthMiddleware from '../middleware/authentication';
import UserController from '../controllers/user_controller';
import cloudWatchLogs from '../services/logger/logger_messages';

const TYPE = 'user authentication';

module.exports = (router, passport) => {

    router.route('/login/facebook')
        .get(passport.authenticate('facebook'));

    router.get('/login/facebook/callback', passport.authenticate('facebook', {
	failureRedirect : '/',
	session : false
    }), (req, res) => {
        cloudWatchLogs.LogSuccessfullPost(TYPE);
	res.status(HttpStatus.OK).send(req.user);
    });

    router.post('/signup', passport.authenticate('local-signup', {
	failureRedirect: '/',
    	session : false
    }), (req, res) => {
	cloudWatchLogs.LogSuccessfullPost(TYPE);
	res.status(HttpStatus.CREATED).send(req.user);
    });

    router.get('/fail_login', (req, res) => {
	cloudWatchLogs.LogSuccessfu(TYPE);
	res.status(HttpStatus.FORBIDDEN).send({message: 'Invalid username or password.'});
    });
    
    router.post('/login', passport.authenticate('local-login', {
    	session : false,
	failureRedirect : '/fail_login'
    }), (req, res) => {
	cloudWatchLogs.LogSuccessfullPost(TYPE);
	res.status(HttpStatus.OK).send(req.user);
    });

    router.route('/signup/facebook')
        .post(UserController.SignUpWithFacebook);
    
    router.get('/logout', (req, res) => {
	AuthController.removeToken(req, res, (result) => {
	    if (result) {
		cloudWatchLogs.LogSuccessfullDelete(TYPE);
		res.status(HttpStatus.OK).send({message : "Succesfully Logout"});
	    }
	});
    });

    router.route('/delete_user/:user_id')
        .delete(AuthMiddleware.isAuthenticated, UserController.deleteUser);

}
