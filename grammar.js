/**
 * @file A query language and execution engine made at Sanity, Inc, for filtering and projecting JSON documents.
 * @author Evan Bancroft <contact@evanbancroft.com>
 * @license MIT
 */

const json = require("tree-sitter-json/grammar");

/// <reference types="tree-sitter-cli/dsl" />
module.exports = grammar(json, {
  name: "groq",

  extras: ($, original) => [
    ...original,
    $.comment,
    /[\s\uFEFF\u2060\u200B\u00A0]/,
  ],

  rules: {
    // The entry point of any GROQ query is an expression
    document: ($, original) => choice($.expression, original),

    // Comments
    comment: (_) =>
      token(
        choice(seq("//", /.*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      ),

    number: (_, original) => original,

    // Strings
    string: ($, original) =>
      choice(
        seq('"', repeat(choice(/[^"\\]+/, $.escape_sequence)), '"'),
        seq("'", repeat(choice(/[^'\\]+/, $.escape_sequence)), "'"),
      ),

    escape_sequence: ($) =>
      choice(/\\['"\\\/bfnrt]/, /\\u[0-9a-fA-F]{4}/, /\\u\{[0-9a-fA-F]+\}/),

    // Basic literals
    null: ($) => "null",
    true: ($) => "true",
    false: ($) => "false",
    identifier: ($) => /[A-Za-z_][A-Za-z0-9_]*/,

    // Arrays
    array: ($, original) =>
      choice(
        original,
        seq(
          "[",
          optional(
            seq(
              $.array_element,
              repeat(seq(",", $.array_element)),
              optional(","),
            ),
          ),
          "]",
        ),
      ),

    array_element: ($) => prec.left(seq(optional("..."), $.expression)),

    // Objects
    object: ($, original) =>
      choice(
        original,
        seq(
          "{",
          optional(
            choice(
              seq(
                $.object_attribute,
                repeat(seq(",", $.object_attribute)),
                optional(","),
              ),
            ),
          ),
          "}",
        ),
      ),

    object_attribute: ($) =>
      choice(
        seq($.string, ":", $.expression),
        $.expression,
        seq($.this_attribute, $.js_insert),
        seq("...", optional($.expression)),
      ),

    // Pairs
    groq_pair: ($) => prec.left(1, seq($.expression, "=>", $.expression)),
    pair: (_, original) => original,

    // Ranges
    range: ($) =>
      choice(
        seq($.expression, "..", $.expression),
        seq($.expression, "...", $.expression),
      ),

    // Simple expressions
    this_expression: ($) => "@",
    this_attribute: ($) => prec.left($.identifier),
    everything_expression: ($) => "*",
    parent_expression: ($) => /\^+/,

    // Function calls
    function_call: ($) =>
      seq(
        optional(seq($.identifier, "::")),
        $.identifier,
        "(",
        optional(seq($.expression, repeat(seq(",", $.expression)))),
        ")",
      ),

    // Traversal operators
    attribute_access: ($) =>
      prec(1, choice(seq(".", $.identifier), seq("[", $.string, "]"))),
    element_access: ($) => prec(1, seq("[", $.number, "]")),
    filter: ($) => seq("[", $.expression, "]"),
    slice: ($) => seq("[", $.range, "]"),
    array_postfix: ($) => "[]",
    projection: ($) => prec(1, seq(optional("|"), $.object)),
    dereference: ($) => prec.left(seq("->", optional($.identifier))),
    variable: ($) => seq("$", $.identifier),
    js_insert: ($) => seq("${", $.identifier, "}"),

    // Operators
    unary_operator: ($) => choice("+", "-", "!"),
    binary_operator: ($) =>
      choice(
        "**", // Power
        "*",
        "/",
        "%", // Multiplicative
        "+",
        "-", // Additive
        "==",
        "!=",
        ">",
        ">=",
        "<",
        "<=", // Comparison
        "in",
        "match", // Other comparison
        "&&", // And
        "||", // Or
      ),

    asc: ($) => seq($.expression, "asc"),
    desc: ($) => seq($.expression, "desc"),

    // Pipe function calls
    pipe_function_call: ($) => seq($.expression, "|", $.function_call),

    // Main expression rule combining everything
    expression: ($) =>
      prec(
        2,
        choice(
          $.null,
          $.true,
          $.false,
          $.number,
          $.string,
          $.array,
          $.object,
          $.this_expression,
          $.function_call,
          $.this_attribute,
          $.everything_expression,
          $.parent_expression,
          $.variable,
          $.js_insert,
          prec.left(seq("(", $.expression, ")")),
          prec.left(seq($.expression, $.attribute_access)),
          prec.left(seq($.expression, $.element_access)),
          prec.left(seq($.expression, $.slice)),
          prec.left(seq($.expression, $.filter)),
          prec.left(seq($.expression, $.array_postfix)),
          prec.left(seq($.expression, $.projection)),
          prec.left(seq($.expression, $.dereference)),
          prec.left(seq($.unary_operator, $.expression)),
          prec.left(seq($.expression, $.binary_operator, $.expression)),
          $.pipe_function_call,
          $.asc,
          $.desc,
          $.groq_pair,
          $.pair,
        ),
      ),
  },
});
