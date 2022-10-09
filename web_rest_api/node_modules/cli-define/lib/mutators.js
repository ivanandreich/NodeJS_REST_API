var mutators = {
  cmd: {
    parent: true,
    options: false,
    commands: false,
    sections: true,
    names: false,
    key: true,
    name: true,
    extra: true,
    options: true,
    commands: true,
    last: true
  },
  arg: {
    names: false,
    key: true,
    name: true,
    optional: true,
    multiple: true,
    value: true,
    converter: true,
    extra: true,
    converter: true,
    action: true
  },
  prg: {
    converter: true,
    configure: true,
  }
}

module.exports = mutators;
