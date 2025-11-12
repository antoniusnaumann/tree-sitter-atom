; Highlight queries for Atom programming language

; Comments
(comment) @comment

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

; Struct fields
(struct_field
  (identifier) @property)

; Struct field initialization
(struct_field_init
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

; Loop variables
(loop_variable) @variable.builtin

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
  "::"
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

; Call expressions - highlight function name
(call_expression
  (expression
    (identifier) @function.call))

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

; Match patterns
(pattern
  (identifier) @variable.parameter)

; Wildcard pattern
(pattern
  "_" @constant.builtin)

; String interpolation
(interpolated_string
  "\\(" @punctuation.special
  ")" @punctuation.special)

; Special identifiers (fallback - should be last)
(identifier) @variable
