import matplotlib.pyplot as plt

# Algorithm names
algorithms = ["Random Forest", "KNN", "SVM", "Logistic Regression"]

# Accuracies from your results
accuracies = [0.9991, 0.9855, 0.9540, 0.8443]

plt.figure(figsize=(8, 5))
plt.bar(algorithms, accuracies)
plt.xlabel("Algorithms")
plt.ylabel("Accuracy")
plt.title("Comparative Analysis of ML Algorithms")

# Show accuracy values on bars
for i, v in enumerate(accuracies):
    plt.text(i, v + 0.005, str(round(v, 4)), ha="center")

plt.ylim(0.8, 1.01)
plt.show()
