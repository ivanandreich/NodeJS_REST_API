function create(req, next) {
  var opts = req.argv
    , pkg = opts.pkg
    , clazz;

  var defname = 'program';
  var name = opts.name || defname;
  var clazz = opts.clazz || require('cli-define').Program;
  var prg = opts.program || new clazz(name);
  if(pkg) prg.package(pkg);

  var sets = !prg.name() || (prg.name() === defname);

  // inherit name from package descriptor
  if(prg.package() && prg.package().name && sets) {
    prg.name(prg.package().name);
  }
  req.program = prg;
  next();
}

module.exports = create;
