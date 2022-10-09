# Define

Chainable argument builder for a command line interface.

## Install

```
npm install cli-define
```

## Test

```
npm test
```

## API

```javascript
var path = require('path');
var cli = require('cli-define')(path.join(__dirname, 'package.json'));
cli
  .option('-f --file <file...>', 'files to copy')
  .option('-v --verbose', 'print more information')
  .version()
  .help()
cli.command('cp')
  .description('copy files')
  .action(function(cmd, options, raw) {
    // execute copy logic here, scope is the program instance
    console.dir(this.file);
  })
```

The recommended way to define options is to use the self-documenting `name` convention:

```javascript
-v                            // => flag
--verbose                     // => flag
-v --verbose                  // => flag
-v, --verbose                 // => flag
-v | --verbose                // => flag
--option [value]              // => option (optional) 
--option <value>              // => option (required)
--option [value...]           // => option (optional, repeatable)
--option <value...>           // => option (required, repeatable)
```

### Module

#### .(package, [name], [description])

Initialize the program.

* `package`: Path to the module `package.json` used to extract default program version and description.
* `name`: Specific name for the program, overrides `package.json`.
* `description`: Specific description for the program, overrides `package.json`.

Returns a `Program` instance.

### Program(package, [name], [description])

The root of the definition hierarchy, `Program` extends `Command`.

#### converter([fn])

A function used to coerce the value of unparsed arguments.

* `fn`: A function used to coerce type or validate it's value.

#### description([value])

Get or set the program description.

#### name([value])

Get or set the program name.

### Command(name, [description], [options])

Represents a command option.

#### action([fn])

Get or set a callback function for the command.

* `fn`: The callback function.

#### command(name, [description], [options])

```javascript
cli.command('install', 'install a package')
cli.command('install')
  .description('install a package')
  .action(function(cmd, args){})
```

Adds a command option.

* `name`: The name of the command.
* `description`: The command description.
* `options`: The argument options.

If `description` is specified returns the `Program` otherwise the `Command` instance.

#### commands()

Get a map of the defined commands.

#### description([value])

Get or set the description for the command.

* `description`: The argument description.

#### flag(name, [description], [options])

```javascript
cli.flag('-v --verbose', 'print more information')
cli.flag('-v, --verbose', 'print more information')
cli.flag('-v | --verbose', 'print more information')
```

Explicitly adds a flag option to the command.

* `name`: The name of the flag.
* `description`: The flag description.
* `options`: The argument options.

Returns the parent `Command` for chaining.

#### key([value])

Get or set the `key` for the command automatically generated based on the command `name`.

#### name([value])

Get or set the full string name of the command.

#### names()

Array of name components (read only).

#### option(name, [description], [options])

```javascript
cli.option('-d', 'debug')                                 // => Flag
cli.option('--debug', 'debug')                            // => Flag
cli.option('-v --verbose', 'verbose')                     // => Flag
cli.option('--port [n]', 'port')                          // => Optional option
cli.option('--port [n]', 'port', 8080)                    // => Optional option w/default
cli.option('--port <n>', 'port', parseInt)                // => Required option w/coercion
cli.option('--port [n]', 'port', 8080, parseInt)          // => Optional option w/default+coercion
cli.option('--port [n]', 'port', parseInt, 8080)          // => Optional option w/coercion+default
```

Adds an option to the command.

* `name`: The name of the option.
* `description`: The option description.
* `options`: The argument options.

Returns the parent `Command` for chaining.

#### options()

Get a map of the defined options.

### Option(name, [description], [options])

Represents an option that expects a value, shares all the functionality of the `Argument` super class.

### Flag(name, [description], [options])

Represents an option that does not expect a value and is treated as a `boolean`, shares all the functionality of the `Argument` super class.

### Argument(name, [description], [options])

Abstract super class for all argument definition classes.

You may specify any of the fields below on the options object and they will be transferred to the instance provided they are writable.

#### action([fn])

Get or set a callback function for the argument, this is typically used by `Command` arguments but can also be specified for other arguments.

* `fn`: The callback function.

#### converter([fn])

A function used to coerce the argument value.

* `fn`: A function used to coerce the arguments type or validate it's value.

#### description([value])

Get or set the description for the argument.

* `description`: The argument description.

#### extra([value])

A string representing the remainder of an argument name, given a `name` of `-i --integer <n>`, `extra` will equal `<n>`.

#### key([value])

Get or set the `key` for the argument automatically generated based on the argument `name`.

```javascript
-v            // => v
-v --verbose  // => verbose
-p --port <n> // => port
```

#### multiple([value])

A `boolean` indicating that the argument may be repated, default is `false`.

#### name([value])

Get or set the full string name of the argument.

```javascript
-v
-v --verbose
-v, --verbose
-v | --verbose
-p --port <n>
```

#### names()

Array of name components, does not include the `extra()` value (read only).

#### optional([value])

A `boolean` indicating that the argument is optional, default is `true`.

#### value([value])

Get or set the value assigned to the instance after argument parsing, this may be used to set the default value for an argument.

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.
