const controller = require('../controllers/users');

module.exports = (router) => {
  router.route('/users')
    .post(controller.add)
    .get(controller.getAll); // This route will be protected
  
  router.route('/login')
    .post(controller.login);
};