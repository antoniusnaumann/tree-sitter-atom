# Tuple Expression Parsing Fix

## Problem
Tuple expressions with identifiers failed to parse in block contexts:
- `(1, 2)` worked ✅
- `(b, 1)` failed with ERROR ❌

## Root Cause
The variable_declaration rule had a parenthesized tuple destructuring pattern `(a, b) := expr` that conflicted with tuple expressions. Tree-sitter's GLR parser would try both paths, and ERROR nodes from the failed variable_declaration path would contaminate the parse tree.

Additionally, consecutive parenthesized destructuring statements failed because expressions ending with `)` followed by lines starting with `(` were parsed as function calls due to newlines being treated as insignificant whitespace.

## Solution
Removed the parenthesized tuple destructuring syntax `(a, b) := expr` from variable_declaration. The language already supports and uses unparenthesized tuple destructuring `a, b := expr` throughout the standard library.

### Changes Made
- Removed `prec.dynamic(-1, seq('(', commaSep($.value_identifier), ')'))` from variable_declaration choice
- Kept unparenthesized form: `seq($.value_identifier, ',', commaSep($.value_identifier))`

## What Works Now
✅ Tuple expressions with identifiers: `(b, 1)`, `(a, b)`
✅ Tuple expressions in blocks: `{ (b, 1) }`
✅ Tuple expressions in match arms: `match(x) { 1 { (b, 1) } }`
✅ Tuple destructuring (unparenthesized): `a, b := (1, 2)`
✅ Multiple consecutive destructuring: `a, b := 1, 2; c, d := 3, 4`
✅ Tuple return types: `func() Int, String { (42, "hello") }`
✅ All standard library files parse without errors
✅ Nested tuples: `((1, 2), (3, 4))`

## Testing
- Created comprehensive test suite in `test_tuples_complete.atom`
- Verified all std library files parse without errors
- Verified all example files parse without errors

## Grammar Conventions
Based on actual usage in the codebase:
- **Tuple expressions**: Use parentheses `(1, 2)`, `(a, b)`
- **Tuple destructuring**: Use unparenthesized form `a, b := expr`
- **Tuple return values**: Use parentheses `(value1, value2)`
- **Tuple types**: Can be parenthesized `(Int, String)` or unparenthesized `Int, String`
