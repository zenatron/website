#metadata((
  title: "Week 7 Prep: Regression",
  date: "2025-02-26",
  readingTime: "5min",
  excerpt: "A comprehensive deep dive into Linear and Logistic Regression, including key concepts like regularization and evaluation metrics.",
  tags: ("data-mining", "data-science", "machine-learning", "regression", "algorithms"),
))<frontmatter>

= Linear Regression

== What is Linear Regression?

#link("https://en.wikipedia.org/wiki/Linear_regression")[Linear regression] is a foundational statistical method that models the relationship between a dependent variable and one or more independent variables by fitting a linear equation to observed data. The general form of a multiple linear regression model is given by:

$ y = beta_0 + beta_1 x_1 + beta_2 x_2 + dots.c + beta_n x_n + epsilon, $

where:

- $y$ is the dependent variable,
- $x_1, x_2, dots, x_n$ are the independent variables,
- $beta_0$ is the intercept,
- $beta_1, beta_2, dots, beta_n$ are the coefficients,
- $epsilon$ is the error term.

This model relies on several key *assumptions*:

- *#link("https://en.wikipedia.org/wiki/Linear_relationship")[Linearity]:* The relationship between the predictors and the outcome is linear.
- *#link("https://en.wikipedia.org/wiki/Independence_(probability_theory)")[Independence]:* Observations are independent of each other.
- *#link("https://en.wikipedia.org/wiki/Homoscedasticity_and_heteroscedasticity")[Homoscedasticity]:* The variance of the errors is constant across all levels of the independent variables.
- *Normally Distributed Errors:* The error term $epsilon$ follows a #link("https://en.wikipedia.org/wiki/Normal_distribution")[normal distribution].

Extensions such as #link("https://en.wikipedia.org/wiki/Polynomial_regression")[polynomial regression] allow modeling of non-linear relationships, while #link("https://en.wikipedia.org/wiki/Regularization_(mathematics)")[regularization] techniques help prevent #link("https://en.wikipedia.org/wiki/Overfitting")[overfitting].

== Example Problem

Consider predicting house prices:

- $x_1$: square footage,
- $x_2$: number of bedrooms,
- $x_3$: age of the house.

The model estimates parameters $beta_0, beta_1, beta_2, beta_3$ to minimize the difference between predicted prices and actual observed prices.

== Additional Concepts in Linear Regression

=== Finding the Best Fit Line

There are two main approaches:

+ *Closed-form solution (#link("https://en.wikipedia.org/wiki/Normal_equation")[Normal Equation]):*
  The optimal parameters are computed as:
  $ hat(beta) = (X^T X)^(-1) X^T y, $
  where $X$ is the feature matrix.
+ *Iterative Optimization (#link("https://en.wikipedia.org/wiki/Gradient_descent")[Gradient Descent]):*
  This method updates the parameters iteratively to minimize the cost function.

=== Sum of Squared Errors (SSE)

The #link("https://en.wikipedia.org/wiki/Least_squares")[sum of squared errors] measures the total prediction error:

$ S S E = sum_(i=1)^(N) (y_i - hat(y)_i)^2. $

=== Cost Function

A commonly used cost function is the #link("https://en.wikipedia.org/wiki/Mean_squared_error")[mean squared error (MSE)]:

$ J(beta) = frac(1, 2N) sum_(i=1)^(N) (y_i - hat(y)_i)^2. $

Minimizing $J(beta)$ leads to optimal parameter estimates.

=== Gradient Descent Algorithm

#link("https://en.wikipedia.org/wiki/Gradient_descent")[Gradient descent] is an iterative method to minimize $J(beta)$. The update rule is:

$ beta_j := beta_j - alpha frac(partial J(beta), partial beta_j), $

where $alpha$ is the learning rate.

#line(length: 100%)

=== Regularization in Linear Regression

Regularization techniques prevent overfitting by penalizing large coefficient values:

- *#link("https://en.wikipedia.org/wiki/Ridge_regression")[Ridge Regression (L2 Regularization)]:*
  Adds a penalty proportional to the square of the coefficients:
  $ J(beta) = frac(1, 2N) sum_(i=1)^(N) (y_i - hat(y)_i)^2 + lambda sum_(j=1)^(n) beta_j^2. $
- *#link("https://en.wikipedia.org/wiki/Lasso_regression")[Lasso Regression (L1 Regularization)]:*
  Uses the absolute values of coefficients as a penalty:
  $ J(beta) = frac(1, 2N) sum_(i=1)^(N) (y_i - hat(y)_i)^2 + lambda sum_(j=1)^(n) |beta_j|. $

=== Evaluation Metrics for Linear Regression

- *#link("https://en.wikipedia.org/wiki/Coefficient_of_determination")[R-squared ($R^2$)]:* Proportion of variance explained by the model.
- *Adjusted R-squared:* Adjusts $R^2$ for the number of predictors.
- *Mean Absolute Error (MAE):* Average absolute difference between predictions and actual values.
- *Root Mean Squared Error (RMSE):* The square root of MSE, sensitive to outliers.

=== Additional Considerations

- *#link("https://en.wikipedia.org/wiki/Feature_scaling")[Feature Scaling]:* Standardization or normalization improves gradient descent convergence.
- *#link("https://en.wikipedia.org/wiki/Multicollinearity")[Multicollinearity]:* High correlation among predictors can inflate variance; regularization or dimensionality reduction can help.
- *#link("https://en.wikipedia.org/wiki/Residual_(statistics)")[Residual Analysis]:* Examining residuals helps diagnose model issues like #link("https://en.wikipedia.org/wiki/Homoscedasticity_and_heteroscedasticity")[heteroscedasticity] or non-linearity.

#line(length: 100%)

= Logistic Regression

== What is Logistic Regression?

#link("https://en.wikipedia.org/wiki/Logistic_regression")[Logistic regression] is designed for binary classification. It predicts the probability $p$ that an input belongs to a specific class using the #link("https://en.wikipedia.org/wiki/Sigmoid_function")[sigmoid function]:

$ sigma(z) = frac(1, 1 + e^(-z)), $

with

$ z = beta_0 + beta_1 x_1 + beta_2 x_2 + dots.c + beta_n x_n. $

This transformation confines the output to $(0,1)$, which can be interpreted as a probability. Parameters are estimated using #link("https://en.wikipedia.org/wiki/Maximum_likelihood_estimation")[maximum likelihood estimation (MLE)].

== Example Problem

A classic application is spam detection. With features such as word frequency and sender reputation, the model computes the probability that an email is spam. If $p > 0.5$, the email is classified as spam; otherwise, it is not.

== Additional Concepts in Logistic Regression

=== Log Odds and the Linear Relationship

The log odds are expressed as:

$ log(frac(p, 1 - p)) = z, $

which is a linear function of the predictors. This linearity simplifies both interpretation and parameter estimation.

=== Transformation in Logistic Regression

The #link("https://en.wikipedia.org/wiki/Sigmoid_function")[sigmoid function] transforms the linear output into a probability:

$ p = sigma(z) = frac(1, 1 + e^(-z)). $

=== Cost Function for Logistic Regression

The model is trained using the log loss (or #link("https://en.wikipedia.org/wiki/Cross_entropy")[cross-entropy loss]):

$ J(beta) = -frac(1, N) sum_(i=1)^(N) [y_i log(p_i) + (1 - y_i) log(1 - p_i)], $

where $p_i = sigma(z_i)$.

=== Gradient Descent for Logistic Regression

Gradient descent is applied similarly:

$ beta_j := beta_j - alpha frac(partial J(beta), partial beta_j), $

with the gradient given by:

$ frac(partial J(beta), partial beta_j) = frac(1, N) sum_(i=1)^(N) (p_i - y_i) x_(i j). $

#line(length: 100%)

=== Regularization in Logistic Regression

To avoid overfitting:

- *#link("https://en.wikipedia.org/wiki/Ridge_regression")[L2 Regularization]:*
  Adds a penalty term:
  $ J(beta) = -frac(1, N) sum_(i=1)^(N) [y_i log(p_i) + (1 - y_i) log(1 - p_i)] + lambda sum_(j=1)^(n) beta_j^2. $
- *#link("https://en.wikipedia.org/wiki/Lasso_regression")[L1 Regularization]:*
  Uses the absolute values of coefficients:
  $ J(beta) = -frac(1, N) sum_(i=1)^(N) [y_i log(p_i) + (1 - y_i) log(1 - p_i)] + lambda sum_(j=1)^(n) |beta_j|. $

=== Evaluation Metrics for Logistic Regression

- *Accuracy:* The fraction of correctly predicted observations.
- *#link("https://en.wikipedia.org/wiki/Precision_and_recall")[Precision]:* Proportion of positive identifications that are correct.
- *#link("https://en.wikipedia.org/wiki/Precision_and_recall")[Recall (Sensitivity)]:* Proportion of actual positives correctly identified.
- *#link("https://en.wikipedia.org/wiki/F-score")[F1-Score]:* The harmonic mean of precision and recall.
- *#link("https://en.wikipedia.org/wiki/Receiver_operating_characteristic")[ROC Curve] & #link("https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve")[AUC]:* The ROC curve plots the true positive rate against the false positive rate; AUC quantifies overall performance.

=== Additional Considerations

- *#link("https://en.wikipedia.org/wiki/Maximum_likelihood_estimation")[Maximum Likelihood Estimation (MLE)]:* Logistic regression uses MLE to estimate parameters.
- *Multiclass Extensions:* Methods such as #link("https://en.wikipedia.org/wiki/Multiclass_classification#One-vs.-rest")[one-vs-rest] and #link("https://en.wikipedia.org/wiki/Multinomial_logistic_regression")[softmax regression] extend logistic regression to handle multiple classes.
- *Threshold Tuning:* Adjusting the default threshold of 0.5 can help balance precision and recall for specific applications.

#line(length: 100%)

= Classification vs. Regression

== Classification (Project 2)

Classification tasks involve predicting discrete labels. For example, identifying spam emails (1 for spam, 0 for not spam) employs models like #link("https://en.wikipedia.org/wiki/Logistic_regression")[logistic regression], #link("https://en.wikipedia.org/wiki/Random_forest")[random forest], or #link("https://en.wikipedia.org/wiki/Support_vector_machine")[SVM]. Evaluation metrics include accuracy, precision, recall, F1-score, and ROC-AUC, focusing on correctly assigning observations to categories.

== Regression (Project 3)

Regression tasks involve predicting continuous numerical values. For example, forecasting house prices uses #link("https://en.wikipedia.org/wiki/Linear_regression")[linear regression]. Performance is measured using metrics such as SSE, MSE, RMSE, $R^2$, and Adjusted $R^2$, emphasizing the accurate prediction of magnitudes.

= Linear vs. Logistic Regression

== Key Differences

- *Output Nature:*
  - _Linear Regression_ outputs continuous values based on a linear equation.
  - _Logistic Regression_ outputs probabilities via a #link("https://en.wikipedia.org/wiki/Sigmoid_function")[sigmoid transformation], which are then mapped to discrete classes.

- *Error Metrics:*
  - _Linear Regression_ is evaluated using metrics like SSE, MSE, RMSE, and #link("https://en.wikipedia.org/wiki/Coefficient_of_determination")[R-squared]
  - _Logistic Regression_ is evaluated using log loss (cross-entropy) and classification metrics such as accuracy, precision, recall, F1-score, and ROC-AUC.

- *Modeling Approach:*
  - _Linear Regression_ assumes a direct linear relationship between the predictors and the response variable.
  - _Logistic Regression_ models the log odds of the outcome as a linear combination of predictors, then applies the sigmoid function to produce probability estimates.

Understanding these concepts in depth—from regularization techniques that mitigate overfitting to the evaluation metrics tailored for continuous or categorical outcomes—provides a robust foundation for selecting and fine-tuning regression models in data science and machine learning tasks.
