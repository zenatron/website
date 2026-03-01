#metadata((
  title: "MDX Rendering Test",
  date: "2025-01-02",
  readingTime: "10min",
  excerpt: "Test to see how MDX gets rendered on my site!",
  tags: ("mdx", "markdown", "latex", "web-dev"),
))<frontmatter>
#import "_components.typ": callout

This is a demo of MDX rendering on my site. MDX allows you to use React components in your Markdown!

= Interactive Components

Here's a simple counter component:

// Interactive counter removed — was a React component

= Math Support

MDX also supports math equations:

Inline math: $E = m c^2$

Block math:

$ frac(d, d x) e^x = e^x $

= Code Highlighting

== JavaScript

```js
function hello() {
  console.log("Hello, world!");
  
  // This is a comment
  const greeting = "Hello";
  const name = "World";
  
  return `${greeting}, ${name}!`;
}
```

== TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('User not found');
      }
      return response.json();
    });
}
```

== Python

```python
def fibonacci(n):
    """Generate the Fibonacci sequence up to n"""
    a, b = 0, 1
    while a < n:
        yield a
        a, b = b, a + b
        
# Example usage
for num in fibonacci(100):
    print(num)
```

== CSS

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}
```

= Tables

#table(
  columns: 3,
  table.header([*Name*], [*Age*], [*Occupation*]),
  [John], [30], [Developer],
  [Jane], [25], [Designer],
)

= Images

You can use Next.js Image component in your MDX files (once properly set up).

= Links

#link("/")[Visit my homepage]

= Lists

- Item 1
- Item 2
  - Nested item 1
  - Nested item 2
- Item 3

+ First item
+ Second item
+ Third item

= Blockquotes

#quote(block: true)[This is a blockquote.

It can span multiple lines.]

= Callouts

Here are examples of the different types of callouts available:

#callout("info")[This is an information callout with the emoji inline with the text.]

#callout("warning", title: "Warning")[This is a warning callout with both a title and emoji.]

#callout("error", title: "Error")[This is an error callout with a title but no emoji.]

#callout("success")[This is a success callout with no title and no emoji.]

#callout("note", title: "Custom Note Title")[This is a note callout with a custom title and emoji.]

#callout("tip")[This is a tip callout with the emoji inline with the text. Perfect for quick tips!]

= Horizontal Rule

#line(length: 100%)

== Colored Text Test
This is #html.elem("span", attrs: (style: "color: red;"))[red text] and #html.elem("span", attrs: (style: "color: blue;"))[blue text].

== Text Shadows
This is #html.elem("span", attrs: (style: "text-shadow: 2px 2px 4px rgba(0,0,0,0.6);"))[shadowed text].

== Gradient Text
This is #html.elem("span", attrs: (style: "background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); -webkit-background-clip: text; color: transparent;"))[gradient text].

== Highlighted Text
This is #html.elem("span", attrs: (style: "background-color: yellow;"))[highlighted text].

== Rotated Text
This is #html.elem("span", attrs: (style: "display: inline-block; transform: rotate(10deg);"))[rotated text].

== Text With Borders
This is #html.elem("span", attrs: (style: "border: 1px solid black; padding: 2px;"))[text with borders].

== Outlined Text
This is #html.elem("span", attrs: (style: "color: white; -webkit-text-stroke: 1px black;"))[outlined text].

== Animated Text
This is #html.elem("span", attrs: (class: "animate-heartbeat"))[animated text].

== Wavy Strikethrough
This is #html.elem("span", attrs: (style: "text-decoration: line-through; text-decoration-style: wavy;"))[wavy strikethrough text].

== Blurred Text
This is #html.elem("span", attrs: (style: "filter: blur(2px);"))[blurred text].

== Vertical Text
This is #html.elem("span", attrs: (style: "writing-mode: vertical-lr; text-orientation: upright;"))[vertical text].

== Glowing Text
This is #html.elem("span", attrs: (style: "color: white; text-shadow: 0 0 8px #00f, 0 0 16px #00f;"))[glowing text].

== Super/Subscript
This is superscript (H#html.elem("sup")[2]O) and subscript (CO#html.elem("sub")[2]).


= Horizontal Rules
#line(length: 100%)

= Emphasis

*This is bold text*

*This is bold text*

_This is italic text_

_This is italic text_

~~Strikethrough~~

= Blockquotes

#quote(block: true)[Blockquotes can also be nested...]
#quote(block: true)[...by using additional greater-than signs right next to each other...]
#quote(block: true)[...or with spaces between arrows.]

= Lists

Unordered

- Create a list by starting a line with `+`, `-`, or `*`
- Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    - Ac tristique libero volutpat at
    - Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
- Very easy!

Ordered

+ Lorem ipsum dolor sit amet
+ Consectetur adipiscing elit
+ Integer molestie lorem at massa


+ You can use sequential numbers...
+ ...or keep all the numbers as `1.`

Start numbering with offset:

+ foo
+ bar


= Code

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

```
Sample text here...
```

Syntax highlighting

```js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

= Latex

== Inline Latex
Inline Latex is rendered inline with the text.
$E = m c^2$

== Block Latex
Block Latex is rendered as a block of text.

$ integral_0^infinity frac(x^3, e^x) dif x = frac(pi^4, 15) $

$ sum_(i=0)^n i^2 = frac((n^2+n)(2n+1), 6) $

$ frac(1, 2 pi i) integral.cont_C frac(f(z), z - z_0) dif z $

$ lim_(x -> 0) frac(sin x, x) = 1 $

== Fractions

$ frac(frac(1, x) + frac(1, y), y - z) $

$ frac(1, frac(1, x) + frac(1, y)) $

== Quadratic Formula

$ x = frac(-b plus.minus sqrt(b^2 - 4 a c), 2 a) $

== Matrices

$ mat(delim: "(", a, b; c, d) $

== Arrays

$ mat(delim: #none,
  a, b, c;
  d, e, f;
) $

= Tables

#table(
  columns: 2,
  table.header([*Option*], [*Description*]),
  [data], [path to data files to supply the data that will be passed into templates.],
  [engine], [engine to be used for processing templates. Handlebars is the default.],
  [ext], [extension to be used for dest files.],
)

Right aligned columns

#table(
  columns: 2,
  table.header([*Option*], [*Description*]),
  [data], [path to data files to supply the data that will be passed into templates.],
  [engine], [engine to be used for processing templates. Handlebars is the default.],
  [ext], [extension to be used for dest files.],
)


= Links

#link("http://dev.nodeca.com")[link text]

#link("http://nodeca.github.io/pica/demo/")[link with title]

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


= Images

#html.elem("img", attrs: (src: "https://octodex.github.com/images/minion.png", alt: "Minion", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))
#html.elem("img", attrs: (src: "https://octodex.github.com/images/stormtroopocat.jpg", alt: "Stormtroopocat", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))

Like links, Images also have a footnote style syntax

#html.elem("img", attrs: (src: "https://octodex.github.com/images/dojocat.jpg", alt: "Alt text", style: "border-radius: 0.5rem; margin: 1.5rem auto; max-width: 100%; height: auto;"))
