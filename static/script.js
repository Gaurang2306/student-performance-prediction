const form = document.getElementById("predictionForm");
const predictButton = document.getElementById("predictButton");
const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");

const scoreFields = ["reading_score", "writing_score"];

// Restrict both scores to whole numbers between 0 and 100.
scoreFields.forEach((id) => {
    const input = document.getElementById(id);

    input.addEventListener("input", () => {
        if (input.value === "") {
            return;
        }

        const value = Number(input.value);

        if (value > 100) {
            input.value = "100";
        } else if (value < 0) {
            input.value = "0";
        } else if (!Number.isInteger(value)) {
            input.value = String(Math.floor(value));
        }
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.textContent = "";
    resultSection.hidden = true;

    // Validate scores before sending the request.
    for (const id of scoreFields) {
        const input = document.getElementById(id);
        const value = input.value.trim();
        const score = Number(value);

        if (
            value === "" ||
            !Number.isFinite(score) ||
            !Number.isInteger(score) ||
            score < 0 ||
            score > 100
        ) {
            errorMessage.textContent =
                "Reading and writing scores must be whole numbers from 0 to 100.";
            input.focus();
            return;
        }
    }

    const formData = {
        reading_score: Number(
            document.getElementById("reading_score").value
        ),
        writing_score: Number(
            document.getElementById("writing_score").value
        ),
        gender: document.getElementById("gender").value,
        race_ethnicity: document.getElementById("race_ethnicity").value,
        parental_education:
            document.getElementById("parental_education").value,
        lunch: document.getElementById("lunch").value,
        test_preparation:
            document.getElementById("test_preparation").value
    };

    predictButton.disabled = true;
    predictButton.textContent = "Predicting...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Unable to predict the score."
            );
        }

        const score = Number(result.prediction);

        if (!Number.isFinite(score)) {
            throw new Error("The server returned an invalid prediction.");
        }

        const displayedScore = Math.max(0, Math.min(100, score));

        document.getElementById("predictedScore").textContent =
            displayedScore.toFixed(2);

        document.getElementById("scoreProgress").style.width =
            `${displayedScore}%`;

        resultSection.hidden = false;
        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    } catch (error) {
        errorMessage.textContent =
            error.message || "Something went wrong. Please try again.";
    } finally {
        predictButton.disabled = false;
        predictButton.textContent = "Predict Mathematics Score";
    }
});
