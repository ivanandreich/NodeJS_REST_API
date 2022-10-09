# Command Line Error

Unified error handling for command line interfaces.

## About

Most command line programs under-utilize the ability to use multiple non-zero
exit codes to indicate the type of error encountered, typically most programs
exit with an exit status of `1` which gives no indication of what type of
error occured.

The benefit of using multiple non-zero exit codes is that it is much easier to *programatically* determine the type of error that occured when invoking a program from another program without parsing `stderr`.

If a program documents it's exit status codes then a callee can ignore `stderr` and provide it's own indication of the type of error that occured.

This module is a set of helper functions and an error class designed to help creators of command line interfaces to structure their error handling around pre-defined error instances with different non-zero exit codes.

## Features

* Seamless integration with [ttycolor][ttycolor]
* Exit status codes associated with an `Error` instance
* Message replacement parameters at definition or runtime
* Auto-incrementing exit status codes
* Load error definitions from locale aware json documents

## Installation

```
npm install cli-error
```

## Developers

```
git clone https://github.com/freeformsystems/cli-error.git
cd cli-error && npm install && npm test
```

## Test

```
npm test
```

## Examples

The [bin](https://github.com/freeformsystems/cli-error/tree/master/bin) directory contains example programs.

## Usage

### Definition

Use `define` and `raise` to use auto-incrementing exit status codes and reference errors by identifier, adapted from the [argv](https://github.com/freeformsystems/cli-error/blob/master/bin/argv) example executable.

```
./bin/argv; echo $?;
```

```javascript
var clierr = require('cli-error');
var define = clierr.define, raise = clierr.raise, errors = clierr.errors;
define('EARGLENGTH', 'too few arguments');
if(process.argv.length < 3) {
  raise(errors.EARGLENGTH);
}
```

### Manual

If you prefer you can create errors as needed, adapted from the [manual](https://github.com/freeformsystems/cli-error/tree/master/bin/manual) example executable.

```
./bin/manual; echo $?;
```

```javascript
var clierr = require('cli-error'), Error = clierr.error;
var err = new Error('fatal: %s not found', 128, ['file.json']);
// print formatted message to stderr
err.error();
// use the error exit status code 
err.exit();
```

## API

### Configuration

Configure the options for the module by passing an object when requiring the
module:

```javascript
var clierr = require('..')({name: 'program'});
```

* `name`: The name for the error instances, default is
  `basename(process.argv[1])`.
* `start`: A number indicating the start when auto-incrementing exit status
  codes, default `64`.
* `log`: String path to a log file or a `WritableStream`.
* `flags`: Flags to use when creating the log file stream (default is `a`), only applies when the log property is a string.
* `prefix`: A prefix for messages used when printing errors using the `console`
  methods. May be a boolean `true` to use `name` as the prefix (like standard
  error messages), a `string` or a `function` that returns a prefix.
* `lang`: Final fallback language identifer used when loading language files, default `en`.
* `locales`: Directory containing the locale specific error definition files,
  default if a 'locales' directory relative to the directory containing the
  executable.
* `lc`: Array of environment variable names to test first before finding the
  first `LC` variable when loading language definitions. Default is `['LC_ALL', 'LC_MESSAGES']`.

### Module

#### clear()

Clear all error definitions.

#### open([file, flags])

Opens a log file (or stream) and redirects the `console` methods to write to the log file.

* `file`: The file path or stream, default is `config.log`.
* `flags`: The file flags when opening the file, default is `a`.

#### close()

Closes an existing log file stream and restore the `console.error` and `console.warn` functions.

#### config

Map of configuration information.

#### CliError

Reference to the `CliError` class.

#### define(key, message, [parameters], [code])

Define an error by named key.

* `key`: The error key.
* `message`: The error message.
* `parameters`: Array of message replacement parameters (optional).
* `code`: Specific exit status code for the error (optional).

Returns an `ErrorDefinition` instance.

#### ErrorDefinition

Reference to the `ErrorDefinition` class.

#### errors

Map of error definitions.

#### exit(err, trace, ...)

Exit the program with a fatal error from an error definition.

* `err`: The error definition.
* `trace`: Whether to print the stack trace.
* `...`: Message replacement parameters.

#### file([options], callback)

Load error definitions from a locale specific `JSON` document respecting the `LC` environment variables.

This method implements a merge stategy so that error messages are always available , unless the configuration property `lang` has been changed and `options.fallback` has not been specified then the fallback file path will be `locales/en.json` relative to the directory containing the executable.

* `options`: An object containing file load options.
* `callback`: A callback function.

The callback signature is `function(err, file, errors, lang)`.

##### Options

* `lang`: Specify a language identifier, use this if you know the users
  language ahead of time (for example, your application provides a
  configuration option for the locale). If `lang` is specified the `LC`
  environment variables are not searched.
* `fallback`: Fallback language identifier, overrides `config.lang`.
* `locales`: Directory containing error definition files, overrides
  `config.locales`.
* `lc`: Array of environment variable names, overrides `config.lc`.

#### load(source)

Load error definitions from a `source` array.

#### raise(err, ...)

* `err`: A `CliError` instance.
* `...`: Message replacement parameters.

Raise an error from an error definition. If there are no defined listeners for `uncaughtException` this method will print the formatted error message, using `console.error` and exit with the status code associated with the error instance. The stack trace is not printed to `stderr`.

#### warn(err, trace, ...)

Print a warn message from an error definition.

* `err`: The error definition.
* `trace`: Whether to print the stack trace.
* `...`: Message replacement parameters.

### CliError

An `Error` subclass.

#### new CliError(message|error, [code], [parameters], [name])

* `message|error`: A string message or another `Error` to wrap.
* `code`: The exit status code.
* `parameters`: Message replacement parameters.
* `name`: A specific name for the error.

#### code

The exit status code.

#### error(trace, ...)

Print an error message to `stderr` optionally including a stack trace.

* `trace`: Whether to print the stack trace.
* `...`: Message replacement parameters.

#### exit()

Exit the program with the exit status code associated with the error instance.

#### format([...])

Retrive a formatted message using the arguments passed to `format()` with the message assigned to the error.

#### key

The identifier for the error, only available when created from an error definition.

#### info

Array of raw stack trace information, see the [v8 stack trace api][v8stackapi] for more information.

#### message

The error message.

#### name

The name for the instance, this will be the name of the program being executed unless configured with a different name.

#### parameters

Array of message parameters set when the error was defined.

#### pop()

Remove the last element in the stack trace and update the underlying data.

####shift()

Remove the first element in the stack trace and update the underlying data.

#### source

A source `Error` instance if the error wraps another error.

####splice(index, amount)

Remove elements from the stack trace and update the underlying data.

* `index`: The start index.
* `amount`: The number of items to delete.

Note unlike `Array.splice()` this method does not allow inserting elements.

#### stack

String representation of the stack trace when the error was instantiated.

#### stacktrace

Array of stack trace lines with leading and trailing whitespace removed.

#### stringify(trace, ...)

Get a `JSON` string representation of this error instance.

* `trace`: Whether to print the stack trace.
* `...`: Message replacement parameters.

#### toObject(trace, ...)

Get an object suitable for passing to `JSON.stringify`.

* `trace`: Whether to print the stack trace.
* `...`: Message replacement parameters.

#### warn(trace, ...)

Print a warn message to `stderr` optionally including a stack trace.

* `trace`: Whether to print the stack trace.
* `...`: Message replacement parameters.

### ErrorDefinition

An error definfition is used to reference an error by identifier (key).

### new ErrorDefinition(key, message, code, parameters)

* `key`: The identifier for the error definition.
* `message`: A string message.
* `code`: The exit status code.
* `parameters`: Message replacement parameters.

#### code

The exit status code.

#### key

The key used to identify the error.

#### message

The error message.

#### parameters

Array of message replacement parameters.

#### toError([e], [parameters], [code])

Convert an error definition to a `CliError` instance.

* `e`: A source error.
* `parameters`: An array of message replacement parameters.
* `code`: An exit status code.

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.

[ttycolor]: https://github.com/freeformsystems/ttycolor
[v8stackapi]: http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
