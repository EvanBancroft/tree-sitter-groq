package tree_sitter_groq_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_groq "github.com/evanbancroft/tree-sitter-groq/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_groq.Language())
	if language == nil {
		t.Errorf("Error loading Groq grammar")
	}
}
