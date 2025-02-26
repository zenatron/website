---
title: "Week 7 Prep: Regression"
date: "2025-02-26"
excerpt: "A comprehensive deep dive into Linear and Logistic Regression, including key concepts like regularization and evaluation metrics."
tags: ["datamining", "datascience", "machinelearning", "regression", "algorithms"]
---
## Linear Regression

### What is Linear Regression?
[Linear regression](https://en.wikipedia.org/wiki/Linear_regression) is a foundational statistical method that models the relationship between a dependent variable and one or more independent variables by fitting a linear equation to observed data. The general form of a multiple linear regression model is given by:
$$
y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \cdots + \beta_n x_n + \epsilon,
$$
where:
- $y$ is the dependent variable,
- $x_1, x_2, \dots, x_n$ are the independent variables,
- $\beta_0$ is the intercept,
- $\beta_1, \beta_2, \dots, \beta_n$ are the coefficients,
- $\epsilon$ is the error term.

This model relies on several key **assumptions**:
- **[Linearity](https://en.wikipedia.org/wiki/Linear_relationship):** The relationship between the predictors and the outcome is linear.
- **[Independence](https://en.wikipedia.org/wiki/Independence_(probability_theory)):** Observations are independent of each other.
- **[Homoscedasticity](https://en.wikipedia.org/wiki/Homoscedasticity_and_heteroscedasticity):** The variance of the errors is constant across all levels of the independent variables.
- **Normally Distributed Errors:** The error term $\epsilon$ follows a [normal distribution](https://en.wikipedia.org/wiki/Normal_distribution).

Extensions such as [polynomial regression](https://en.wikipedia.org/wiki/Polynomial_regression) allow modeling of non-linear relationships, while [regularization](https://en.wikipedia.org/wiki/Regularization_(mathematics)) techniques help prevent [overfitting](https://en.wikipedia.org/wiki/Overfitting).

### Example Problem
Consider predicting house prices:
- $x_1$: square footage,
- $x_2$: number of bedrooms,
- $x_3$: age of the house.

The model estimates parameters $\beta_0, \beta_1, \beta_2, \beta_3$ to minimize the difference between predicted prices and actual observed prices.

### Additional Concepts in Linear Regression

#### Finding the Best Fit Line
There are two main approaches:
1. **Closed-form solution ([Normal Equation](https://en.wikipedia.org/wiki/Normal_equation)):**  
   The optimal parameters are computed as:
   $$
   \hat{\beta} = (X^TX)^{-1}X^Ty,
   $$
   where $X$ is the feature matrix.
2. **Iterative Optimization ([Gradient Descent](https://en.wikipedia.org/wiki/Gradient_descent)):**  
   This method updates the parameters iteratively to minimize the cost function.

#### Sum of Squared Errors (SSE)
The [sum of squared errors](https://en.wikipedia.org/wiki/Least_squares) measures the total prediction error:
$$
SSE = \sum_{i=1}^{N} (y_i - \hat{y}_i)^2.
$$

#### Cost Function
A commonly used cost function is the [mean squared error (MSE)](https://en.wikipedia.org/wiki/Mean_squared_error):
$$
J(\beta) = \frac{1}{2N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2.
$$
Minimizing $J(\beta)$ leads to optimal parameter estimates.

#### Gradient Descent Algorithm
[Gradient descent](https://en.wikipedia.org/wiki/Gradient_descent) is an iterative method to minimize $J(\beta)$. The update rule is:
$$
\beta_j := \beta_j - \alpha \frac{\partial J(\beta)}{\partial \beta_j},
$$
where $\alpha$ is the learning rate.

---
#### Regularization in Linear Regression
Regularization techniques prevent overfitting by penalizing large coefficient values:
- **[Ridge Regression (L2 Regularization)](https://en.wikipedia.org/wiki/Ridge_regression):**  
  Adds a penalty proportional to the square of the coefficients:
  $$
  J(\beta) = \frac{1}{2N}\sum_{i=1}^{N}(y_i - \hat{y}_i)^2 + \lambda\sum_{j=1}^{n}\beta_j^2.
  $$
- **[Lasso Regression (L1 Regularization)](https://en.wikipedia.org/wiki/Lasso_regression):**  
  Uses the absolute values of coefficients as a penalty:
  $$
  J(\beta) = \frac{1}{2N}\sum_{i=1}^{N}(y_i - \hat{y}_i)^2 + \lambda\sum_{j=1}^{n}|\beta_j|.
  $$

#### Evaluation Metrics for Linear Regression
- **[R-squared ($R^2$)](https://en.wikipedia.org/wiki/Coefficient_of_determination):** Proportion of variance explained by the model.
- **Adjusted R-squared:** Adjusts $R^2$ for the number of predictors.
- **Mean Absolute Error (MAE):** Average absolute difference between predictions and actual values.
- **Root Mean Squared Error (RMSE):** The square root of MSE, sensitive to outliers.

#### Additional Considerations
- **[Feature Scaling](https://en.wikipedia.org/wiki/Feature_scaling):** Standardization or normalization improves gradient descent convergence.
- **[Multicollinearity](https://en.wikipedia.org/wiki/Multicollinearity):** High correlation among predictors can inflate variance; regularization or dimensionality reduction can help.
- **[Residual Analysis](https://en.wikipedia.org/wiki/Residual_(statistics)):** Examining residuals helps diagnose model issues like [heteroscedasticity](https://en.wikipedia.org/wiki/Homoscedasticity_and_heteroscedasticity)) or non-linearity.

---

## Logistic Regression

### What is Logistic Regression?
[Logistic regression](https://en.wikipedia.org/wiki/Logistic_regression) is designed for binary classification. It predicts the probability $p$ that an input belongs to a specific class using the [sigmoid function](https://en.wikipedia.org/wiki/Sigmoid_function):
$$
\sigma(z) = \frac{1}{1+e^{-z}},
$$
with
$$
z = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \cdots + \beta_n x_n.
$$
This transformation confines the output to $(0,1)$, which can be interpreted as a probability. Parameters are estimated using [maximum likelihood estimation (MLE)](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation).

### Example Problem
A classic application is spam detection. With features such as word frequency and sender reputation, the model computes the probability that an email is spam. If $p > 0.5$, the email is classified as spam; otherwise, it is not.

### Additional Concepts in Logistic Regression

#### Log Odds and the Linear Relationship
The log odds are expressed as:
$$
\log\left(\frac{p}{1-p}\right) = z,
$$
which is a linear function of the predictors. This linearity simplifies both interpretation and parameter estimation.

#### Transformation in Logistic Regression
The [sigmoid function](https://en.wikipedia.org/wiki/Sigmoid_function) transforms the linear output into a probability:
$$
p = \sigma(z) = \frac{1}{1+e^{-z}}.
$$

#### Cost Function for Logistic Regression
The model is trained using the log loss (or [cross-entropy loss](https://en.wikipedia.org/wiki/Cross_entropy)):
$$
J(\beta) = -\frac{1}{N}\sum_{i=1}^{N}\left[y_i\log(p_i) + (1-y_i)\log(1-p_i)\right],
$$
where $p_i = \sigma(z_i)$.

#### Gradient Descent for Logistic Regression
Gradient descent is applied similarly:
$$
\beta_j := \beta_j - \alpha \frac{\partial J(\beta)}{\partial \beta_j},
$$
with the gradient given by:
$$
\frac{\partial J(\beta)}{\partial \beta_j} = \frac{1}{N}\sum_{i=1}^{N}(p_i - y_i)x_{ij}.
$$

 ---
#### Regularization in Logistic Regression
To avoid overfitting:
- **[L2 Regularization](https://en.wikipedia.org/wiki/Ridge_regression):**  
  Adds a penalty term:
  $$
  J(\beta) = -\frac{1}{N}\sum_{i=1}^{N}\left[y_i\log(p_i) + (1-y_i)\log(1-p_i)\right] + \lambda\sum_{j=1}^{n}\beta_j^2.
  $$
- **[L1 Regularization](https://en.wikipedia.org/wiki/Lasso_regression):**  
  Uses the absolute values of coefficients:
  $$
  J(\beta) = -\frac{1}{N}\sum_{i=1}^{N}\left[y_i\log(p_i) + (1-y_i)\log(1-p_i)\right] + \lambda\sum_{j=1}^{n}|\beta_j|.
  $$

#### Evaluation Metrics for Logistic Regression
- **Accuracy:** The fraction of correctly predicted observations.
- **[Precision](https://en.wikipedia.org/wiki/Precision_and_recall):** Proportion of positive identifications that are correct.
- [**Recall (Sensitivity)](https://en.wikipedia.org/wiki/Precision_and_recall):** Proportion of actual positives correctly identified.
- [**F1-Score](https://en.wikipedia.org/wiki/F-score):** The harmonic mean of precision and recall.
- **[ROC Curve](https://en.wikipedia.org/wiki/Receiver_operating_characteristic) & [AUC](https://en.wikipedia.org/wiki/Receiver_operating_characteristic#Area_under_the_curve):** The ROC curve plots the true positive rate against the false positive rate; AUC quantifies overall performance.

#### Additional Considerations
- **[Maximum Likelihood Estimation (MLE)](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation):** Logistic regression uses MLE to estimate parameters.
- **Multiclass Extensions:** Methods such as [one-vs-rest](https://en.wikipedia.org/wiki/Multiclass_classification#One-vs.-rest) and [softmax regression](https://en.wikipedia.org/wiki/Multinomial_logistic_regression) extend logistic regression to handle multiple classes.
- **Threshold Tuning:** Adjusting the default threshold of 0.5 can help balance precision and recall for specific applications.

---

## Classification vs. Regression

### Classification (Project 2)
Classification tasks involve predicting discrete labels. For example, identifying spam emails (1 for spam, 0 for not spam) employs models like [logistic regression](https://en.wikipedia.org/wiki/Logistic_regression), [random forest](https://en.wikipedia.org/wiki/Random_forest), or [SVM](https://en.wikipedia.org/wiki/Support_vector_machine). Evaluation metrics include accuracy, precision, recall, F1-score, and ROC-AUC, focusing on correctly assigning observations to categories.

### Regression (Project 3)
Regression tasks involve predicting continuous numerical values. For example, forecasting house prices uses [linear regression](https://en.wikipedia.org/wiki/Linear_regression). Performance is measured using metrics such as SSE, MSE, RMSE, $R^2$, and Adjusted $R^2$, emphasizing the accurate prediction of magnitudes.

## Linear vs. Logistic Regression

### Key Differences

- **Output Nature:**
  - *Linear Regression* outputs continuous values based on a linear equation.
  - *Logistic Regression* outputs probabilities via a [sigmoid transformation](https://en.wikipedia.org/wiki/Sigmoid_function), which are then mapped to discrete classes.

- **Error Metrics:**
  - *Linear Regression* is evaluated using metrics like SSE, MSE, RMSE, and [R-squared](https://en.wikipedia.org/wiki/Coefficient_of_determination)
  - *Logistic Regression* is evaluated using log loss (cross-entropy) and classification metrics such as accuracy, precision, recall, F1-score, and ROC-AUC.

- **Modeling Approach:**
  - *Linear Regression* assumes a direct linear relationship between the predictors and the response variable.
  - *Logistic Regression* models the log odds of the outcome as a linear combination of predictors, then applies the sigmoid function to produce probability estimates.

Understanding these concepts in depth—from regularization techniques that mitigate overfitting to the evaluation metrics tailored for continuous or categorical outcomes—provides a robust foundation for selecting and fine-tuning regression models in data science and machine learning tasks.