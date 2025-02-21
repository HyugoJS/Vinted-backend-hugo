const isAuthenticated = (req, res, next) => {
  // Cette route est réservée aux user authentifiés
  // ils vont envoyer leurs token, je dois vérifier si le token reçu est valide
  //console.log(req.headers.authorization);
  //console.log(req.headers.authorization.replace("Bearer ", ""));
  const token = req.headers.authorization.replace("Bearer ", "");
  // Si j'ai pas reçu de token ===> Unauthorized
  // Aller verifier si en BDD j'ai bien un user dont le token est celui-ci
  // Si ce n'est pas le cas ===> Unauthorized

  // Je peux modifier req pour faire passer des infos aux middlewares suivants

  // Je passe au middleware suivant
  next();
};

module.exports = isAuthenticated;
