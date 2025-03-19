; inherits: json

; Operators
(binary_operator) @operator

; Literals
(number) @number
(string) @string

; Variables and identifiers
(identifier) @variable
(variable (identifier) @variable)

; Function calls
(function_call
  (identifier) @function)
(pipe_function_call) @function

; Special expressions
(everything_expression) @constant
(this_attribute
  (identifier) @variable)

; Arrays and objects
(array) @punctuation.bracket
(array_element) @variable
(object) @punctuation.bracket
(object_attribute) @property

; Range expressions
(range) @operator
(slice) @operator

; Expressions (general)
(expression) @expression

; Descriptors
(desc) @keyword

; Punctuation
["[" "]" "{" "}" "("] @punctuation.bracket
["," "." ":"] @punctuation.delimiter
