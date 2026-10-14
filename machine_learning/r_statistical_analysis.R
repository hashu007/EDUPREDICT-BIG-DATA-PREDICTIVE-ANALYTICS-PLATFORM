# ==============================================================================
# EduPredict - Statistical Modeling & Inferential Analytics (R / RStudio)
# ==============================================================================
# Purpose: Exploratory Data Analysis, Hypothesis Testing (ANOVA), and
#          Multivariate Binomial Logistic Regression for Student Dropout.
# ==============================================================================

# Install required packages if missing
required_packages <- c("tidyverse", "corrplot", "broom", "pROC", "caret")
new_packages <- required_packages[!(required_packages %in% installed.packages()[,"Package"])]
if(length(new_packages)) install.packages(new_packages)

suppressPackageStartupMessages({
  library(tidyverse)
  library(corrplot)
  library(broom)
  library(pROC)
})

cat("==================================================================\n")
cat(" EduPredict - RStudio Statistical Inference & Model Fitting\n")
cat("==================================================================\n\n")

# 1. Simulate Cohort Dataset
set.seed(42)
n <- 1200

cohort_data <- tibble(
  student_id = sprintf("STU-2026-%04d", 1:n),
  department = sample(c("Computer Science", "Data Science", "Software Engineering", "Business Analytics"), n, replace = TRUE),
  attendance_rate = pmin(pmax(rnorm(n, mean = 80, sd = 15), 20), 100),
  lms_weekly_hours = pmin(pmax(rnorm(n, mean = 8.5, sd = 4), 0.5), 25),
  midterms_score = pmin(pmax(0.45 * attendance_rate + 0.3 * (lms_weekly_hours * 3.5) + rnorm(n, 20, 10), 20), 100),
  assignments_score = pmin(pmax(midterms_score + rnorm(n, 5, 8), 15), 100),
  consecutive_absences = pmax(round(rexp(n, rate = 0.8)), 0)
) %>%
  mutate(
    # Latent probability of dropout
    logit_p = -0.07 * attendance_rate - 0.10 * lms_weekly_hours - 0.04 * midterms_score + 0.30 * consecutive_absences + 3.8,
    prob_dropout = 1 / (1 + exp(-logit_p)),
    dropout_status = factor(ifelse(runif(n) < prob_dropout, "Dropout", "Retained"), levels = c("Retained", "Dropout"))
  )

# 2. Analysis of Variance (ANOVA): Attendance across Academic Departments
cat("[1] Performing One-Way ANOVA across Academic Departments...\n")
anova_model <- aov(attendance_rate ~ department, data = cohort_data)
print(summary(anova_model))

# 3. Pearson Correlation Matrix
cat("\n[2] Computing Pearson Correlation Matrix of Engagement & Performance...\n")
cor_data <- cohort_data %>%
  select(attendance_rate, lms_weekly_hours, midterms_score, assignments_score, consecutive_absences)
cor_matrix <- cor(cor_data)
print(round(cor_matrix, 3))

# 4. Multivariate Binomial Logistic Regression
cat("\n[3] Fitting Binomial Logistic Regression (Logit Link Function)...\n")
logit_fit <- glm(
  dropout_status ~ attendance_rate + lms_weekly_hours + midterms_score + consecutive_absences + department,
  data = cohort_data,
  family = binomial(link = "logit")
)

# Display tidy model summary with Odds Ratios and 95% Confidence Intervals
model_summary <- tidy(logit_fit, exponentiate = TRUE, conf.int = TRUE)
print(model_summary)

# 5. ROC-AUC Evaluation
cat("\n[4] Evaluating ROC-AUC on In-Sample Estimations...\n")
predicted_probs <- predict(logit_fit, type = "response")
roc_curve <- roc(cohort_data$dropout_status, predicted_probs)
cat("ROC-AUC Metric:", auc(roc_curve), "\n")

cat("\n==================================================================\n")
cat(" R Statistical Analysis Complete. Ready for Knitr / RMarkdown Report.\n")
cat("==================================================================\n")
