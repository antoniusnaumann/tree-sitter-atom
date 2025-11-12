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
  STRUCT: 15,
  ENUM: 16,
  ASSIGN: 14,
  FIELD_DEF: 17,
  TYPE: 18,
  DECLARATION: 19
};

module.exports = grammar({
  name: 'atom',

  word: $ => $.identifier,

  externals: $ => [],

  conflicts: $ => [
    [$.struct_definition, $.enum_definition],
    [$.variable_declaration, $.constant_declaration],
    [$.struct_type, $.enum_type],
    [$.parenthesized_expression, $.tuple_expression],
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

    tuple_type: $ => prec(PREC.TYPE, seq(
      '(',
      commaSep($.type),
      ')'
    )),

    generic_type: $ => prec(PREC.TYPE + 3, seq(
      $.identifier,
      '(',
      commaSep($.type_parameter),
      ')'
    )),

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
      optional(seq('(', commaSep($.type_parameter), ';')),
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
      optional(seq(commaSep($.type_parameter), ';')),
      optional(commaSep($.parameter)),
      ')',
      optional($.return_type),
      $.block
    ),

    parameter: $ => prec(PREC.TYPE, choice(
      seq($.identifier, $.type),
      seq($.identifier, $.type, '=', $.expression),
      $.variadic_parameter
    )),

    variadic_parameter: $ => prec(PREC.TYPE, seq(
      $.identifier,
      $.variadic_type
    )),

    return_type: $ => $.type,

    // Variable declaration
    variable_declaration: $ => prec(PREC.DECLARATION, seq(
      $.identifier,
      choice(
        seq(':', $.type, '=', $.expression),
        seq(':=', $.expression)
      )
    )),

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
      $.identifier,
      $.number_literal,
      $.string_literal,
      seq($.identifier, '(', optional(commaSep($.pattern)), ')'),
      '_'
    ),

    // Expressions (ordered by precedence, highest first)
    expression: $ => choice(
      $.comptime_expression,
      $.assignment_expression,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.method_call,
      $.field_access,
      $.namespace_access,
      $.index_access,
      $.interpolation,
      $.tuple_expression,
      $.closure,
      $.block,
      $.parenthesized_expression,
      $.identifier,
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

    namespace_access: $ => prec(PREC.FIELD + 1, seq(
      $.expression,
      '::',
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
      commaSep(choice(
        seq($.identifier, ':', $.expression),
        $.expression
      )),
      ')'
    )),

    struct_expression: $ => prec.left(PREC.TYPE + 2, seq(
      $.identifier,
      '(',
      optional(commaSep($.struct_field_init)),
      ')'
    )),

    struct_field_init: $ => choice(
      seq($.identifier, ':', $.expression),
      $.expression
    ),

    enum_expression: $ => prec.left(PREC.TYPE + 2, seq(
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