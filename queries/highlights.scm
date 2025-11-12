; Helix highlight queries for Atom programming language

; Comments
(comment) @comment

; Keywords
[
  "match"
  "loop"
  "return"
] @keyword.control

; Types
(primitive_type) @type.builtin

; Struct and enum definitions
(struct_definition
  (identifier) @type)

(enum_definition
  (identifier) @type)

; Function definitions
(function_definition
  (identifier) @function)

; Variable declarations
(variable_declaration
  (identifier) @variable)

; Constant declarations
(constant_declaration
  (identifier) @constant)

; Parameters
(parameter
  (identifier) @variable.parameter)

(variadic_parameter
  (identifier) @variable.parameter)

; Struct fields
(struct_field
  (identifier) @property)

; Enum cases
(enum_case
  (identifier) @constructor)

; Operators
[
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "||"
  "!"
  "~"
  "&"
  "|"
  "<<"
  ">>"
  "="
  "+="
  "-="
  "*="
  "/="
  "%="
  "<<="
  ">>="
  "|="
  "&="
  "++="
  "++"
] @operator

; Literals
(number_literal) @number

(string_literal) @string

(rune_literal) @character

; Punctuation
[
  "("
  ")"
  "{"
  "}"
  ","
  ";"
  ":"
  "."
] @punctuation.delimiter

; Brackets
[
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket

; Visibility modifiers
(visibility) @attribute

; Comptime expressions
(comptime_expression
  "#" @keyword.directive)

; Test blocks
(test_block
  (string_literal)? @string.special)

; Import statements
(import_statement
  (identifier) @namespace)

; Field access
(field_access
  "." @punctuation.delimiter
  (identifier) @property)

; Namespace access
(namespace_access
  "::" @punctuation.delimiter
  (identifier) @namespace)

; Method calls
(method_call
  "." @punctuation.delimiter
  (identifier) @function.method)

; Type annotations
(type) @type

; Generic types
(generic_type
  (identifier) @type)

; Type parameters
(type_parameter
  (identifier) @type.parameter)

; Tuple types
(tuple_type) @type

; Sized types
(sized_type) @type

; Variadic types
(variadic_type) @type

; Closures
(closure) @keyword.function

; Match patterns
(pattern
  (identifier) @variable)

; Wildcard pattern
(pattern
  "_" @variable.builtin)

; Special identifiers
(identifier) @variable

; String interpolation
(interpolation
  "\\(" @punctuation.special
  ")" @punctuation.special)