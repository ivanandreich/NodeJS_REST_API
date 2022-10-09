var util = require('util')
  , CliError = require('cli-error').CliError;

/**
 *  An error subclass used to indicate that an error
 *  occured during compilation.
 *
 *  @param message The error message.
 *  @param parameters Message replacement parameters.
 *  @param code A status exit code for the error.
 */
function CompilerError(message, parameters, code) {
  CliError.call(this, message, code, parameters);
}

util.inherits(CompilerError, CliError);

module.exports = CompilerError;
