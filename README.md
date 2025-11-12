# Tree-sitter Grammar for Atom Programming Language

This repository contains a Tree-sitter grammar for the [Atom programming language](https://github.com/sst/atom-lang).

## Features

- Complete syntax highlighting support
- Comprehensive test coverage
- Compatible with Helix editor

## Installation

### For Helix Editor

1. Clone this repository as a submodule in your Atom language project
2. Add the grammar to your Helix configuration

### For other editors

The grammar can be used with any editor that supports Tree-sitter.

## Development

### Prerequisites

- [Tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers#installation)

### Testing

```bash
npm test
```

Or manually:

```bash
tree-sitter generate
tree-sitter test
```

### Adding Tests

Add test cases to `test/atom_test.txt` following the Tree-sitter test format:

```
==================
Test Name
==================

<code here>

---

(expected parse tree here)
```

## Language Features Supported

- Function definitions with visibility modifiers
- Struct and enum definitions
- Variable and constant declarations
- Control flow (match, loop)
- Expressions (binary, unary, calls, etc.)
- Type system (primitives, generics, tuples, variadics)
- String interpolation
- Comments (line and doc comments)
- Test blocks
- Import statements
- Comptime expressions

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a pull request.