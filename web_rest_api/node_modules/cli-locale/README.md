# Locale

Utilities for working with LC environment variables.

## Install

```
npm install cli-locale
```

## Test

```
npm test
```

## API

```javascript
var lc = require('cli-locale')('en_us');
var lang = lc.find(['LC_ALL', 'LC_MESSAGES']);
```

Suppose you load files based on the language identifier and prefer using hyphens to underscores, you can pass a filter function:

```javascript
var lc = require('cli-locale')('en_us');
var lang = lc.find(['LC_ALL', 'LC_MESSAGES'], function(lang) {
  return lang.replace(/_/g, '-');
});
```

You could also use this functionality to convert between language identifiers or to take action on an unsupported language.

### find(search, [filter])

Find the value of an LC environment variable and return a sanitized represention of the locale. If no variable value is found in the search array then this method returns the first available LC variable. If no LC variables are available in the environment this method returns the default `language`.

* `search`: Array of LC environment variables to prefer.
* `filter`: A filter function.

Return a language identifier.

The rules for locating a language identifier are:

* If a variable defined in the search array exists, use it.
* If the value is C return the default `language`.
* Attempt to find the first variable that begins with LC.
* If the value is C return the default `language`.
* If no language is found use `LANG`, if the value of `LANG` is C return the
  default language.
* If all the above tests fail return the default language.

## language

A language identifier to use when no value could be extracted via the environment, default value is `en`.

### sanitize(lang, [filter], [strict])

Sanitize the value of an LC variable removing any character encoding portion, such that `en_GB.UTF-8` becomes `en_gb`.

* `lang`: A language identifier extracted from an LC environment variable.
* `filter`: A filter function.
* `strict`: Return null rather than the default language `en` when no language could be extracted from the environment.

Returns a sanitized language identifier.

## License

Everything is [MIT](http://en.wikipedia.org/wiki/MIT_License). Read the [license](/LICENSE) if you feel inclined.
