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
  (identifier) @variable.member)

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

(rune_literal) @string.special

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
(visibility) @keyword.modifier

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
  (identifier) @variable.member)

; Method calls
(method_call
  "." @punctuation.delimiter
  (identifier) @function.method)

 ; Function calls
 ; (call_expression
 ;   (identifier) @function.call)

; Type annotations
(type) @type

; Generic types
(generic_type
  (identifier) @type)

; Tuple types
(tuple_type) @type

; Sized types
(sized_type) @type

; Variadic types
(variadic_type) @type

 ; Struct expressions
 ; (struct_expression
 ;   (identifier)? @type)
 
 ; Enum expressions
 ; (enum_expression
 ;   (identifier) @constructor)

; Closures
(closure) @keyword.function

; Match patterns
(pattern
  (identifier) @variable)

; Wildcard pattern
(pattern
  "_" @variable.builtin)

 ; Boolean literals (implemented as enums)
 ; [
 ;   "True"
 ;   "False"
 ; ] @constant.builtin

; Special identifiers
(identifier) @variable

; String interpolation
(interpolation
  "\\(" @punctuation.special
  ")" @punctuation.special)