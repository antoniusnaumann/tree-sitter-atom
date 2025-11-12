// Precedences
const PREC = {
  CONCAT: 1,
  LOGICAL_OR: 2,
  LOGICAL_AND: 3,
  BITWISE_OR: 4,
  BITWISE_AND: 5,
  EQUAL: 6,
  COMPARE: 7,
  SHIFT: 8,
  ADD: 9,
  MULTIPLY: 10,
  UNARY: 11,
  FIELD: 12,
  CALL: 13,
  ASSIGN: 14,
  STRUCT: 15,
  ENUM: 16,
  FIELD_DEF: 17
};

module.exports = grammar({
  name: 'atom',

  word: $ => $.identifier,

  conflicts: $ => [
    [$.struct_field, $.parameter, $.variadic_parameter],
    [$.enum_case, $.parameter],
    [$.struct_definition, $.enum_definition],
    [$.struct_definition, $.enum_definition, $.function_definition],
    [$.variable_declaration, $.constant_declaration],
    [$.struct_type, $.enum_type],
    [$.parameter, $.variadic_parameter, $.expression, $.struct_expression, $.enum_expression],
    [$.parenthesized_expression, $.tuple_expression, $.struct_field_init],
    [$.loop_statement, $.expression],
    [$.type, $.variadic_parameter],
    [$.tuple_type, $.enum_case],
    [$.call_expression, $.index_access]
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
      $.import_statement,
      $.comment
    ),

    // Comments
    comment: $ => choice(
      seq('///', /.*/),
      seq('//', /.*/)
    ),

    // Identifiers
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // Types
    type: $ => choice(
      $.primitive_type,
      $.struct_type,
      $.enum_type,
      $.tuple_type,
      $.generic_type,
      $.variadic_type,
      $.sized_type
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

    struct_type: $ => $.identifier,

    enum_type: $ => $.identifier,

    tuple_type: $ => seq(
      '(',
      commaSep($.type),
      ')'
    ),

    generic_type: $ => seq(
      $.identifier,
      '(',
      commaSep($.type_parameter),
      ')'
    ),

    type_parameter: $ => choice(
      $.type,
      seq($.identifier, '=', $.type)
    ),

    variadic_type: $ => seq(
      $.type,
      choice('*', '+')
    ),

    // Struct definition
    struct_definition: $ => prec(PREC.STRUCT, seq(
      optional($.visibility),
      $.identifier,
      '(',
      optional(commaSep($.struct_field)),
      ')'
    )),

    visibility: $ => choice('+', '-'),

    struct_field: $ => prec(PREC.FIELD_DEF, choice(
      seq($.identifier, $.type),
      seq('..', $.identifier)
    )),

    // Enum definition
    enum_definition: $ => prec(PREC.ENUM, seq(
      optional($.visibility),
      $.identifier,
      '(',
      repeat($.enum_case),
      ')'
    )),

    enum_case: $ => choice(
      seq($.identifier, '(', optional(commaSep($.type)), ')'),
      $.identifier
    ),

    // Function definition
    function_definition: $ => seq(
      optional($.visibility),
      $.identifier,
      '(',
      optional(commaSep($.parameter)),
      ')',
      optional($.return_type),
      $.block
    ),

    parameter: $ => prec(PREC.FIELD_DEF + 1, choice(
      seq($.identifier, $.type),
      seq($.identifier, $.type, '=', $.expression),
      $.variadic_parameter
    )),

    variadic_parameter: $ => seq(
      $.identifier,
      $.variadic_type
    ),

    return_type: $ => $.type,

    // Variable declaration
    variable_declaration: $ => seq(
      $.identifier,
      optional(seq(':', $.type)),
      choice('=', ':='),
      $.expression
    ),

    // Constant declaration
    constant_declaration: $ => seq(
      $.identifier,
      '=',
      $.expression
    ),

    // Block
    block: $ => seq(
      '{',
      repeat($.statement),
      optional($.expression),
      '}'
    ),

    // Statements
    statement: $ => choice(
      $.variable_declaration,
      $.expression_statement,
      $.return_statement,
      $.loop_statement,
      $.match_statement
    ),

    expression_statement: $ => seq($.expression, ';'),

    return_statement: $ => seq('return', optional($.expression), ';'),

    // Loop
    loop_statement: $ => seq(
      'loop',
      optional(choice(
        $.expression,
        seq('(', $.expression, ')'),
        seq('(', $.number_literal, ')')
      )),
      $.block
    ),

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
      $.identifier,
      $.number_literal,
      $.string_literal,
      seq($.identifier, '(', optional(commaSep($.pattern)), ')'),
      '_'
    ),

    // Expressions
    expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.method_call,
      $.field_access,
      $.index_access,
      $.assignment_expression,
      $.comptime_expression,
      $.interpolation,
      $.parenthesized_expression,
      $.identifier,
      $.number_literal,
      $.string_literal,
      $.rune_literal,
      $.tuple_expression,
      $.struct_expression,
      $.enum_expression,
      $.closure,
      $.block
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

    call_expression: $ => prec(PREC.CALL, seq(
      $.expression,
      '(',
      optional(commaSep($.expression)),
      ')'
    )),

    method_call: $ => prec(PREC.CALL, seq(
      $.expression,
      '.',
      $.identifier,
      '(',
      optional(commaSep($.expression)),
      ')'
    )),

    field_access: $ => prec(PREC.FIELD, seq(
      $.expression,
      '.',
      $.identifier
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

    interpolation: $ => prec.left(seq(
      $.string_literal,
      '\\(',
      $.expression,
      ')',
      optional($.string_literal)
    )),

    parenthesized_expression: $ => seq('(', $.expression, ')'),

    number_literal: $ => /\d+(\.\d+)?/,

    string_literal: $ => /"([^"\\]|\\.)*"/,

    rune_literal: $ => /'([^'\\]|\\.)'/,

    tuple_expression: $ => prec(PREC.CALL, seq(
      '(',
      commaSep($.expression),
      ')'
    )),

    struct_expression: $ => prec(PREC.STRUCT, seq(
      optional($.identifier),
      '(',
      optional(commaSep($.struct_field_init)),
      ')'
    )),

    struct_field_init: $ => prec(PREC.FIELD_DEF, choice(
      seq($.identifier, ':', $.expression),
      $.expression
    )),

    enum_expression: $ => prec(PREC.ENUM, seq(
      $.identifier,
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
      seq($.identifier, '::*'),
      seq($.identifier, '::(', commaSep($.identifier), ')')
    )
  }
});

function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule))));
}