module.exports = {
  // General formatting options
  printWidth: 80, // Specify the line length that the printer will wrap on.
  tabWidth: 2, // Specify the number of spaces per indentation-level.
  useTabs: false, // Indent lines with tabs instead of spaces.
  semi: true, // Print semicolons at the ends of statements.
  singleQuote: false, // Use single quotes instead of double quotes.
  quoteProps: "as-needed", // When to add quotes around object properties.
  jsxSingleQuote: false, // Use single quotes instead of double quotes in JSX.
  trailingComma: "es5", // Print trailing commas wherever possible in multi-line comma-separated syntactic structures.
  bracketSpacing: true, // Print spaces between brackets in object literals.
  bracketSameLine: false, // Put the > of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being alone on the next line.
  arrowParens: "always", // Include parentheses around a sole arrow function parameter.

  // Range options (rarely needed in config, usually CLI)
  // rangeStart: 0,
  // rangeEnd: Infinity,

  // Parser options (Prettier infers this by default, but can be explicit)
  // parser: "babel", // Example for JavaScript

  // File path options (rarely needed in config)
  // filepath: "none",

  // Handling of end-of-line characters
  endOfLine: "lf", // Line Feed only (\n), common on Linux and macOS as well as inside git repos
};
