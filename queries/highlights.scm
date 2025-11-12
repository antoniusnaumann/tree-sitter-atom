; Highlight queries for Atom programming language

; Comments
(comment) @comment

; Types
(primitive_type) @type.builtin

; Keywords
[
  "match"
  "loop"
  "return"
] @keyword

; Struct and enum definitions - capture first identifier only
(struct_definition
  (identifier) @type.definition)

(enum_definition
  (identifier) @type.definition)

; Function definitions - capture first identifier only
(function_definition
  (identifier) @function.definition)

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

; Struct expressions - highlight type name
(struct_expression
  .
  (expression
    (identifier) @type))

; Method calls
(method_call
  "." @punctuation.delimiter
  (identifier) @function.method)

; Call expressions - match function identifiers only (first expression)
; Use . to anchor the pattern to the first child
(call_expression
  .
  (expression
    (identifier) @function.call))

; Type annotations - use struct_type and enum_type
(struct_type
  (identifier) @type)

(enum_type
  (identifier) @type)

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

; Match patterns - don't capture identifiers in patterns as they're bindings
; Only the pattern node itself should be highlighted

; Wildcard pattern
"_" @constant.builtin

; String interpolation
(interpolated_string
  "\\(" @punctuation.special
  ")" @punctuation.special)
