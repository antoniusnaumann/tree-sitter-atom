; Highlight queries for Atom programming language

; Highlight groups are helix editor style 

; Comments
(comment) @comment

; Types
(primitive_type) @type.builtin

; Keywords -- don't add those, they are supposed to be treated like function calls ultimately
; "match" @keyword.control.conditional
; "loop" @keyword.control.repeat
; "return" @keyword.control.return

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
  (identifier) @variable.other.member)

; Struct field initialization
(struct_field_init
  (identifier) @variable.other.member)

; Enum cases
(enum_case
  (identifier) @type.enum.variant)

; Match patterns - enum constructors (first identifier in pattern)
(match_arm
  (pattern
    .
    (identifier) @type.enum.variant))

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
(number_literal) @constant.numeric

(string_literal) @string

(rune_literal) @constant.character

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

; Field access - general pattern (will be overridden by more specific patterns below)
(field_access
  "." @punctuation.delimiter
  (identifier) @variable.other.member)

; Regular namespace access - for non-function contexts
; Only highlight the left side (before ::) as namespace
(namespace_access
  (expression
    (identifier) @namespace)
  "::")

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

; Regular namespace function calls (e.g., math::sin())
; When namespace_access is first child of call_expression:
; - The first identifier (before ::) should be @namespace
; - The second identifier (after ::) should be @function.call
(call_expression
  .
  (expression
    (namespace_access
      (expression
        (identifier) @namespace)
      (identifier) @function.call)))

; UFCS with namespace (e.g., x.cmath::cos()) - MORE SPECIFIC, comes after general patterns
; When namespace_access is first child of call_expression:
; - The field_access identifier (after .) should be @namespace
; - The namespace_access identifier (after ::) should be @function.call  
(call_expression
  .
  (expression
    (namespace_access
      (expression
        (field_access
          (expression)
          (identifier) @namespace))
      (identifier) @function.call)))

; Type annotations - use struct_type and enum_type
; Uppercase identifiers in types are actual types
(struct_type
  (identifier) @type
  (#match? @type "^[A-Z]"))

(enum_type
  (identifier) @type
  (#match? @type "^[A-Z]"))

; Type parameters - lowercase identifiers in type positions (like Gleam)
; This must come AFTER the uppercase type rules to override for lowercase
(struct_type
  (identifier) @type.parameter
  (#match? @type.parameter "^[a-z]"))

(enum_type
  (identifier) @type.parameter
  (#match? @type.parameter "^[a-z]"))

; Generic types
(generic_type
  (identifier) @type)

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
