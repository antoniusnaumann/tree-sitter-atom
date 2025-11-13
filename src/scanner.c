#include "tree_sitter/parser.h"
#include <stdbool.h>

enum TokenType {
  STRING_FRAGMENT,
  INTERPOLATION_START
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
