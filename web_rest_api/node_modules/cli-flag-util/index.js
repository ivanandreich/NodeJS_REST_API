var re = {
  no: function(){return /(\[no-?\]-?)/;}
}

function getNoVariants(arg) {
  if(!arg) return null;
  var name = (typeof arg === 'string') ? arg : arg.name();
  if(re.no().test(name)) {
    var yes = name.replace(re.no(), '');
    var no = name.replace(/^(-+)\[?(no)\]?-?(.*)/, "$1$2-$3");
    return {yes: yes, no: no};
  }
  return false;
}

/**
 *  Expand --[no]- to multiple option names.
 */
function getNoExpansions(names) {
  names = Array.isArray(names) ? names : [];
  var output = [];
  names.forEach(function(name) {
    if(re.no().test(name)) {
      var variants = getNoVariants(name);
      output.push(variants.yes, variants.no);
    }else{
      output.push(name);
    }
  })
  return output;
}

module.exports = {
  re: re,
  getNoVariants: getNoVariants,
  getNoExpansions: getNoExpansions,
}
