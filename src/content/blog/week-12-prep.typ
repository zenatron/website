#import "_components.typ": callout

#metadata((
  title: "Week 12 Prep: Association Rules and Market-Basket Analysis",
  date: "2025-04-06",
  excerpt: "Understanding how items are frequently purchased together using association rules and market-basket analysis.",
  tags: ("data-mining", "machine-learning", "association-rules", "market-basket-analysis"),
  readingTime: "3min",
))<frontmatter>

= What Are Association Rules?

At its core, association rule learning is all about finding relationships between items in large collections of data—like customer purchases. It's used to spot patterns, such as which products are often bought together, by using a set of metrics that help determine how meaningful or useful those patterns actually are.

A typical association rule looks something like this:

$ {A, B} => {C} $

This means that if someone buys items A and B, there's a good chance they'll also buy item C.

To measure how strong or interesting a rule is, we usually look at three key metrics:

+ *Support* – This tells us how often the itemset appears in the dataset.

$ "Support"(X) = frac("Number of transactions containing " X, "Total number of transactions") $

2. *Confidence* – This measures how likely item Y is to be bought when item X is bought.

$ "Confidence"(X => Y) = P(Y|X) = frac("Support"(X union Y), "Support"(X)) $

#callout("info")[Confidence is derived from the definition of conditional probability: $P(E_Y |E_X) = frac(P(E_X sect E_Y), P(E_X))$. In this case, $(X union Y)$ is the itemset of transactions that contain *both* $X$ *and* $Y$.]

3. *Lift* – This shows how much more likely item Y is bought when X is bought, compared to random chance.

$ "Lift"(X => Y) = frac("Support"(X union Y), "Support"(X) times "Support"(Y)) $

  - Lift = 1 means there's no relationship.
  - Lift > 1 suggests a positive association (they go together).
  - Lift < 1 suggests a negative association (they rarely go together).

#link("https://en.wikipedia.org/wiki/Association_rule_learning")[Source: Wikipedia - Association rule learning]

= Market-Basket Analysis

Market-basket analysis is one of the most well-known uses of association rules. Retailers use it to analyze customer purchase behavior—basically figuring out what products tend to end up in the same shopping cart.

By discovering which products are frequently bought together, businesses can make smarter decisions about things like product placement, promotions, and cross-selling strategies.

== Example

There's a famous example that comes up a lot: a grocery store chain supposedly discovered that men who bought *diapers* on *Thursday and Saturday evenings* also tended to buy *beer*. That would translate into a rule like:

$ {"Diapers", "Saturday"} => {"Beer"} $

Let's say the data for that rule looks like this:

- *Support:* 2% of all transactions include both diapers and beer on Saturdays.
- *Confidence:* 60% of the people who bought diapers on Saturday also bought beer.
- *Lift:* 3.0, meaning they're three times more likely to buy beer than the average shopper.

So, what would the store do with this info? They might place beer near the diaper aisle to boost sales (even though, they allegedly did not).

#link("https://en.wikipedia.org/wiki/Market_basket_analysis")[Source: Wikipedia - Market basket analysis]
