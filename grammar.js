// Precedences (higher number = higher precedence = binds tighter)
const PREC = {
  CONCAT: 1,
  LOGICAL_OR: 2,
  LOGICAL_AND: 3,
  EQUAL: 4,        // == !=
  COMPARE: 5,      // < > <= >=
  BITWISE_OR: 6,   // |
  BITWISE_AND: 7,  // &
  SHIFT: 8,        // << >>
  ADD: 9,          // + -
  MULTIPLY: 10,    // * /
  UNARY: 11,       // ! -
  FIELD: 12,
  CALL: 13,
  ASSIGN: 14,
  STRUCT: 15,
  ENUM: 16,
  FIELD_DEF: 17,
  TYPE: 18,
  DECLARATION: 19
};

module.exports = grammar({
  name: 'atom',

  word: $ => $.value_identifier,

  extras: $ => [
    /\s/,  // whitespace
    $.comment
  ],

  externals: $ => [],

  conflicts: $ => [
    [$.struct_type, $.enum_type],
    [$.call_expression, $.index_access],
    [$.struct_field, $.parameter],
    [$.struct_field_list, $.enum_definition],
    [$.type_parameter, $.enum_case],
    [$.primitive_type, $.sized_type],
    [$.variable_declaration, $.expression],
    [$.type_parameter_ref, $.expression],
    [$.type_parameter, $.expression],
    [$.tuple_type, $.variadic_type],
    [$.tuple_expression],
    [$.variadic_type],
    [$.block],
    [$.struct_field_init, $.expression],
    [$.statement, $.expression]  // assignment_expression can be both
  ],

  rules: {
    source_file: $ => repeat($._top_level_item),

    _top_level_item: $ => choice(
      $.struct_definition,
      $.enum_definition,
      $.function_definition,
      $.variable_declaration,
      $.constant_declaration,
      $.test_block,
      $.comment
    ),

    // Comments
    comment: $ => choice(
      seq('///', /.*/),
      seq('//', /.*/)
    ),

    // Identifiers
    // DEPRECATED: Use type_identifier or value_identifier instead
    // identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    
    // Casing-specific identifiers
    // Type names and enum variants must start with uppercase
    type_identifier: $ => /[A-Z][a-zA-Z0-9_]*/,
    
    // Function names, variables, fields, modules must start with lowercase or underscore
    value_identifier: $ => /[a-z_][a-zA-Z0-9_]*/,

    // Types
    type: $ => choice(
      $.primitive_type,
      $.struct_type,
      $.enum_type,
      $.tuple_type,
      $.generic_type,
      $.variadic_type,
      $.sized_type,
      $.type_parameter_ref  // Allow lowercase type parameters in type position
    ),

    primitive_type: $ => choice(
      'Int',
      'UInt',
      'Float',
      'Rune',
      'String',
      'Bool',
      'Void',
      'Type'
    ),

    sized_type: $ => seq(
      choice('Int', 'UInt', 'Float'),
      '(',
      $.number_literal,
      ')'
    ),

    struct_type: $ => $.type_identifier,

    enum_type: $ => $.type_identifier,
    
    // Type parameter reference (lowercase identifier in type position)
    type_parameter_ref: $ => $.value_identifier,

    tuple_type: $ => prec(PREC.TYPE, choice(
      seq('(', commaSep($.type), ')'),
      // Tuple without parens - must have at least 2 elements
      prec.right(-1, seq($.type, ',', commaSep1($.type)))
    )),

    generic_type: $ => prec(PREC.TYPE + 3, seq(
      $.type_identifier,
      '(',
      commaSep($.type_parameter),
      ')'
    )),

    type_parameter: $ => choice(
      $.type,
      seq(choice($.value_identifier, $.type_identifier), '=', $.type)
    ),

    variadic_type: $ => seq(
      $.type,
      choice('*', '+')
    ),

    // Struct definition
    struct_definition: $ => prec.dynamic(2, seq(
      optional($.visibility),
      $.type_identifier,
      $.struct_field_list
    )),

    struct_field_list: $ => seq(
      '(',
      optional(seq(
        alias($._field_or_param, $.struct_field),
        repeat(seq(',', alias($._field_or_param, $.struct_field))),
        optional(',')
      )),
      ')'
    ),

    visibility: $ => choice('+', '-'),

    _field_or_param: $ => choice(
      seq($.value_identifier, $.type),
      seq($.value_identifier, $.type, '=', $.expression),
      seq('..', $.type_identifier)
    ),

    struct_field: $ => prec.dynamic(2, choice(
      seq($.value_identifier, $.type),
      seq('..', $.type_identifier)
    )),

    // Enum definition
    enum_definition: $ => seq(
      optional($.visibility),
      $.type_identifier,
      '(',
      optional(seq(commaSep($.type_parameter), ';')),
      repeat($.enum_case),
      ')'
    ),

    enum_case: $ => choice(
      seq($.type_identifier, '(', optional(commaSep($.type)), ')'),
      $.type_identifier
    ),

    // Function definition
    function_definition: $ => prec.dynamic(3, seq(
      optional($.visibility),
      $.value_identifier,
      '(',
      optional(seq(commaSep($.type_parameter), ';')),
      optional(seq(
        alias($._field_or_param, $.parameter),
        repeat(seq(optional(','), alias($._field_or_param, $.parameter))),
        optional(',')
      )),
      ')',
      optional($.return_type),
      $.block
    )),

    parameter: $ => prec.dynamic(-1, prec(PREC.TYPE, choice(
      seq($.value_identifier, $.type),
      seq($.value_identifier, $.type, '=', $.expression)
    ))),

    return_type: $ => $.type,

    // Variable declaration
    variable_declaration: $ => seq(
      choice(
        $.value_identifier,
        // Tuple destructuring without parens: a, b := expr
        prec.dynamic(-1, seq($.value_identifier, ',', commaSep($.value_identifier)))
      ),
      choice(
        seq(':', $.type, '=', $._assignable_expression),
        prec(-1, seq(':', $.type)),  // Zero-value initialization (lower precedence to prefer longer match)
        seq(':=', $._assignable_expression)
      )
    ),

    // Expression that can be assigned (includes unparenthesized tuples)
    _assignable_expression: $ => choice(
      $.expression,
      alias($.unparenthesized_tuple, $.tuple_expression)
    ),

    // Constant declaration
    constant_declaration: $ => seq(
      choice($.value_identifier, $.type_identifier),
      '=',
      $.expression
    ),

    // Block
    block: $ => seq(
      '{',
      repeat(choice($.statement, $.expression)),
      '}'
    ),

    // Statements
    statement: $ => choice(
      $.variable_declaration,
      $.assignment_expression,  // Assignments can be statements
      $.expression_statement,
      $.loop_statement,
      $.match_statement
    ),

    expression_statement: $ => seq($.expression, ';'),

    // Loop
    loop_statement: $ => prec(PREC.DECLARATION, seq(
      'loop',
      optional(choice(
        $.expression,
        seq('(', $.expression, ')'),
        seq('(', $.number_literal, ')')
      )),
      $.block
    )),

    // Match
    match_statement: $ => seq(
      'match',
      '(',
      $.expression,
      ')',
      '{',
      repeat($.match_arm),
      '}'
    ),

    match_arm: $ => seq(
      $.pattern,
      $.block
    ),

    pattern: $ => choice(
      $.value_identifier,
      $.type_identifier,
      $.number_literal,
      $.string_literal,
      seq($.type_identifier, '(', optional(commaSep($.pattern)), ')'),
      $.parenthesized_expression,  // Allow expressions in parens as patterns (for guards)
      '_'
    ),

    // Expressions (ordered by precedence, highest first)
    expression: $ => choice(
      $.comptime_expression,
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_match_expression,
      $.method_call,
      $.field_access,
      $.namespace_access,
      $.index_access,
      $.struct_expression,
      $.enum_expression,
      $.interpolated_string,
      $.tuple_expression,
      $.closure,
      $.block,
      $.parenthesized_expression,
      $.loop_variable,
      $.value_identifier,
      $.type_identifier,
      $.number_literal,
      $.string_literal,
      $.rune_literal
    ),

    // Constructor expressions (handled separately)
    constructor_expression: $ => choice(
      $.struct_expression,
      $.enum_expression
    ),

    binary_expression: $ => choice(
      ...[
        ['||', PREC.LOGICAL_OR],
        ['&&', PREC.LOGICAL_AND],
        ['==', PREC.EQUAL],
        ['!=', PREC.EQUAL],
        ['<', PREC.COMPARE],
        ['<=', PREC.COMPARE],
        ['>', PREC.COMPARE],
        ['>=', PREC.COMPARE],
        ['|', PREC.BITWISE_OR],
        ['&', PREC.BITWISE_AND],
        ['<<', PREC.SHIFT],
        ['>>', PREC.SHIFT],
        ['+', PREC.ADD],
        ['-', PREC.ADD],
        ['*', PREC.MULTIPLY],
        ['/', PREC.MULTIPLY],
        ['%', PREC.MULTIPLY],
        ['++', PREC.CONCAT]
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $.expression),
          operator,
          field('right', $.expression)
        ))
      )
    ),

    unary_expression: $ => prec(PREC.UNARY, seq(
      choice('-', '!', '~'),
      $.expression
    )),

    call_expression: $ => prec.dynamic(1, prec(PREC.CALL, seq(
      $.expression,
      '(',
      optional(commaSep($.expression)),
      ')'
    ))),

    method_call: $ => prec(PREC.CALL, seq(
      $.expression,
      '.',
      $.value_identifier,
      '(',
      optional(commaSep($.expression)),
      ')'
    )),

    member_match_expression: $ => prec(PREC.CALL, seq(
      $.expression,
      '.',
      'match',
      '(',
      ')',
      '{',
      optional(seq(
        $.match_arm,
        repeat(seq(optional(','), $.match_arm)),
        optional(',')
      )),
      '}'
    )),

    field_access: $ => prec(PREC.FIELD, seq(
      $.expression,
      '.',
      $.value_identifier
    )),

    namespace_access: $ => prec(PREC.FIELD + 1, seq(
      $.expression,
      '::',
      choice($.value_identifier, $.type_identifier, '*')
    )),

    index_access: $ => prec(PREC.CALL, seq(
      $.expression,
      '(',
      $.expression,
      ')'
    )),

    assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
      $.expression,
      choice('=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '|=', '&=', '++='),
      $.expression
    )),

    comptime_expression: $ => seq('#', $.expression),

    loop_variable: $ => /\$\d+/,

    interpolated_string: $ => seq(
      $.string_literal,
      repeat1(seq(
        '\\(',
        $.expression,
        ')',
        optional($.string_literal)
      ))
    ),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    number_literal: $ => choice(
      /0x[0-9a-fA-F]+/,           // Hexadecimal: 0xFF, 0xDEADBEEF
      /0b[01]+/,                   // Binary: 0b1010, 0b11110000
      /\d+(\.\d+)?/                // Decimal: 123, 3.14
    ),

    string_literal: $ => /"([^"\\]|\\.)*"/,

    rune_literal: $ => /'([^'\\]|\\.)'/,

    tuple_expression: $ => prec(PREC.CALL, seq(
      '(',
      commaSep($.expression),
      ')'
    )),

    // Unparenthesized tuple - only allowed as final expression in blocks and in assignments
    unparenthesized_tuple: $ => prec.right(seq(
      $.expression,
      ',',
      commaSep1($.expression)
    )),

    struct_expression: $ => prec.dynamic(-1, prec(PREC.CALL - 1, seq(
      $.expression,
      '(',
      optional(commaSep($.struct_field_init)),
      ')'
    ))),

    struct_field_init: $ => seq($.value_identifier, ':', $.expression),

    enum_expression: $ => prec.left(PREC.TYPE + 2, seq(
      $.type_identifier,
      optional(seq('(', optional(commaSep($.expression)), ')'))
    )),

    closure: $ => seq(
      '(',
      optional(commaSep($.parameter)),
      ')',
      optional($.return_type),
      $.block
    ),

    // Test blocks
    test_block: $ => seq(
      optional($.string_literal),
      $.block
    ),

    // Import statements
    import_statement: $ => choice(
      seq($.value_identifier, '::*'),
      seq($.value_identifier, '::(', commaSep(choice($.value_identifier, $.type_identifier)), ')')
    )
  }
});

function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule))));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
