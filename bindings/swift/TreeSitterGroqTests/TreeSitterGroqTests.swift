import XCTest
import SwiftTreeSitter
import TreeSitterGroq

final class TreeSitterGroqTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_groq())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Groq grammar")
    }
}
