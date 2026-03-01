#metadata((
  title: "Week 2 Prep: The Data Mining Pipeline",
  date: "2025-01-21",
  readingTime: "2min",
  excerpt: "In this blog post we discuss the data mining pipeline.",
  tags: ("data-mining", "data-science", "machine-learning"),
))<frontmatter>

= The Data Mining Pipeline
== Topic: The Data Mining Pipeline (also called Data Science Pipeline, Data Mining Process, etc.)

+ What is data mining? What are some examples of how data mining can be used?
  + #link("https://en.wikipedia.org/wiki/Data_mining")[Data mining] is the process of analyzing large datasets in order to find trends and relationships within data that may not be immediately apparent. For example, a retailer may analyze consumer purchase history to help recommend certain products or predict bestselling items. Another example may be a bank analyzing transaction history to detect fraud.
+ What are the different steps of the pipeline? Briefly discuss each.
  + *Define the Problem*: Clearly outline the objective to ensure the analysis remains focused and relevant.
  + *Collect Data*: Gather data from reliable sources, ensuring it aligns with the problem being solved.
  + *Clean\/Pre-process Data*: Handle missing values, outliers, and inconsistencies to prepare the data for analysis.
  + *Explore and Visualize Data*: Analyze and visualize data to uncover trends, distributions, and correlations.
  + *Build Models*: Use algorithms to develop predictive or descriptive models based on the data.
  + *Evaluate Models*: Assess the models for accuracy, relevance, and robustness.
  + *Deploy and Monitor*: Implement the model in a real-world scenario and monitor its performance over time.
+ Why is defining the problem first so important?
  + Defining the problem is important because it ensures the end goal is clearly stated and measurable. There can be quantitative measures to ensure that the solution addresses the problem at hand. A poorly defined problem can lead to irrelevant conclusions or create solutions that do not solve the problem.
+ Why is data cleaning\/pre-processing important? What are some aspects of data that need to be cleaned (for example, dealing with null values)?
  + Data preprocessing is highly important to ensure the data analysis is relevant and accurate. The "#link("https://en.wikipedia.org/wiki/Garbage_in,_garbage_out")[Garbage In - Garbage Out]" rule emphasizes that poor-quality input data leads to poor results. Skewed or biased data will be reflected in the results. Some of the ways data can be preprocessed include:
    + Removing or #link("https://en.wikipedia.org/wiki/Imputation_(statistics)")[imputing] null values
    + Correcting formatting
    + Correcting #link("https://en.wikipedia.org/wiki/Data_type")[data types]
    + Removing duplicate values
    + #link("https://en.wikipedia.org/wiki/Standard_score")[Standardizing] numeric data
    + #link("https://en.wikipedia.org/wiki/One-hot")[Encoding] categorical data
+ Find an example of some data understanding\/visualizations (e.g., blog post, portfolio). What do you like and\/or dislike about it?
  + An example of a data visualization is this graph of #link("https://www.macrotrends.net/stocks/charts/AAPL/apple/revenue")[Apple Revenue 2010-2024]
  + I like how the histogram is easy to follow and view the increase in revenue throughout the 14 years, as well as being able to zoom into a specific year and view revenue by quarter. They also show percentage increases year-over-year.
  + I don't like how the visualization does not break down the revenue by category, since Apple has multiple revenue streams, including hardware, software, services, and business solutions. The UI and layout of the site could use some improvements.
