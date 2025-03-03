---
title: "Markdown Rendering Test"
date: "2025-01-01"
excerpt: "Test to see how Markdown gets rendered on my site!"
tags: ["markdown", "web-dev"]
---

# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading

### Colored Text Test
This is <span style="color: red;">red text</span> and <span style="color: blue;">blue text</span>.

### Text Shadows
This is <span style="text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">shadowed text</span>.

### Gradient Text
This is <span style="background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); -webkit-background-clip: text; color: transparent;">gradient text</span>.

### Highlighted Text
This is <span style="background-color: yellow;">highlighted text</span>.

### Rotated Text
This is <span style="display: inline-block; transform: rotate(10deg);">rotated text</span>.

### Text With Borders
This is <span style="border: 1px solid black; padding: 2px;">text with borders</span>.

### Outlined Text
This is <span style="color: white; -webkit-text-stroke: 1px black;">outlined text</span>.

### Animated Text
This is <span style="animation: fadeIn 2s infinite;">animated text</span>.

<style>
@keyframes fadeIn {
  0% { opacity: 0; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>

### Wavy Strikethrough
This is <span style="text-decoration: line-through; text-decoration-style: wavy;">wavy strikethrough text</span>.

### Blurred Text
This is <span style="filter: blur(2px);">blurred text</span>.

### Vertical Text
This is <span style="writing-mode: vertical-lr; text-orientation: upright;">vertical text</span>.

### Typewriter Text
<div style="display: inline-block; overflow: hidden; white-space: nowrap; border-right: 2px solid; animation: typing 4s steps(20, end), blink 0.5s step-end infinite;">
Typewriter effect text
</div>

<style>
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes blink {
  from, to { border-color: transparent; }
  50% { border-color: black; }
}
</style>

### Glowing Text
This is <span style="color: white; text-shadow: 0 0 8px #00f, 0 0 16px #00f;">glowing text</span>.

### Super/Subscript
This is superscript (H<sup>2</sup>O) and subscript (CO<sub>2</sub>).


## Horizontal Rules
---

## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~

## Blockquotes

> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.

## Lists

Unordered

+ Create a list by starting a line with `+`, `-`, or `*`
+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...
1. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
1. bar


## Code

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

``` js
var foo = function (bar) {
  return bar++;
};

console.log(foo(5));
```

## Latex

### Inline Latex
Inline Latex is rendered inline with the text.
$E = mc^2$

### Block Latex
Block Latex is rendered as a block of text.

$$
\int_0^\infty \frac{x^3}{e^x} \, dx = \frac{\pi^4}{15}
$$

$$
\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}
$$

$$
\frac{1}{2\pi i} \oint_C \frac{f(z)}{z-z_0} \, dz
$$

$$
\lim_{x \to 0} \frac{\sin x}{x} = 1
$$

### Fractions

$$
\frac{\frac{1}{x} + \frac{1}{y}}{y-z}
$$

$$
\frac{1}{\frac{1}{x} + \frac{1}{y}}
$$

### Quadratic Formula

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### Matrices

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

### Arrays

$$
\begin{array}{c|c|c}
a & b & c \\
\hline
d & e & f \\
\end{array}
$$

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"