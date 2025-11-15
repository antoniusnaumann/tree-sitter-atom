#include "tree_sitter/parser.h"
#include <stdbool.h>
#include <wctype.h>

enum TokenType {
  STRING_FRAGMENT,
  INTERPOLATION_START,
  AUTOMATIC_SEMICOLON,
  STATIC_ARRAY_SIZE_IDENTIFIER
};

void *tree_sitter_atom_external_scanner_create() { return NULL; }
void tree_sitter_atom_external_scanner_destroy(void *payload) {}
unsigned tree_sitter_atom_external_scanner_serialize(void *payload, char *buffer) { return 0; }
void tree_sitter_atom_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}
void tree_sitter_atom_external_scanner_reset(void *payload) {}

static void advance(TSLexer *lexer) {
  lexer->advance(lexer, false);
}

bool tree_sitter_atom_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  // Static array size identifier - only matches if there's NO whitespace before it
  // This allows t*n but not t* n (which would be variadic followed by identifier)
  if (valid_symbols[STATIC_ARRAY_SIZE_IDENTIFIER]) {
    // Check that current lookahead is an identifier start (letter or underscore)
    if (iswalpha(lexer->lookahead) || lexer->lookahead == '_') {
      lexer->result_symbol = STATIC_ARRAY_SIZE_IDENTIFIER;
      // Consume the identifier
      while (iswalnum(lexer->lookahead) || lexer->lookahead == '_') {
        advance(lexer);
      }
      lexer->mark_end(lexer);
      return true;
    }
    return false;
  }
  
  // Try automatic semicolon insertion
  if (valid_symbols[AUTOMATIC_SEMICOLON]) {
    lexer->result_symbol = AUTOMATIC_SEMICOLON;
    
    // Skip whitespace but track if we see a newline
    bool has_newline = false;
    while (iswspace(lexer->lookahead)) {
      if (lexer->lookahead == '\n') {
        has_newline = true;
      }
      advance(lexer);
    }
    
    // Only insert semicolon if we saw a newline
    if (!has_newline) {
      return false;
    }
    
    // Don't insert semicolon if next line starts with these characters (continuations)
    if (lexer->lookahead == '.' ||  // Method chaining: obj.method()
        lexer->lookahead == '+' ||  // Binary operators
        lexer->lookahead == '-' ||
        lexer->lookahead == '*' ||
        lexer->lookahead == '/' ||
        lexer->lookahead == '%' ||
        lexer->lookahead == '=' ||  // Comparison/assignment continuation
        lexer->lookahead == '<' ||
        lexer->lookahead == '>' ||
        lexer->lookahead == '&' ||
        lexer->lookahead == '|' ||
        lexer->lookahead == ',' ||  // Tuple/argument continuation
        lexer->lookahead == ')' ||  // Closing paren
        lexer->lookahead == ']' ||  // Closing bracket
        lexer->lookahead == '}') {  // Closing brace
      return false;
    }
    
    lexer->mark_end(lexer);
    return true;
  }
  
  if (valid_symbols[STRING_FRAGMENT]) {
    bool has_content = false;
    lexer->result_symbol = STRING_FRAGMENT;
    
    while (true) {
      if (lexer->lookahead == '"' || lexer->lookahead == 0) {
        // End of string or EOF
        return has_content;
      } else if (lexer->lookahead == '\\') {
        lexer->mark_end(lexer);
        advance(lexer);
        
        if (lexer->lookahead == '(') {
          // Start of interpolation - stop here, don't consume the \(
          return has_content;
        } else {
          // Regular escape - consume the next char
          if (lexer->lookahead != 0) {
            advance(lexer);
            has_content = true;
          }
        }
      } else {
        advance(lexer);
        has_content = true;
      }
      
      lexer->mark_end(lexer);
    }
  }
  
  if (valid_symbols[INTERPOLATION_START] && lexer->lookahead == '\\') {
    advance(lexer);
    if (lexer->lookahead == '(') {
      advance(lexer);
      lexer->result_symbol = INTERPOLATION_START;
      lexer->mark_end(lexer);
      return true;
    }
  }
  
  return false;
}
