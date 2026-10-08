const meals = [
    "Pizza",
    "Spaghetti Bolognese",
    "Fettuccine Alfredo",
    "Beef Burger",
    "Chicken Alfredo",
    "Chicken Curry",
    "Tacos",
    "Pancakes",
    "Chocolate Chip Cookies",
    "Cheesecake"
];

const THEMEALDB_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const FOODDATA_API = "https://api.nal.usda.gov/fdc/v1/foods/search";
const FOODDATA_API_KEY = "DEMO_KEY";

function searchMeal() {
    const searchInput = document.getElementById("mealSearch");
    const errorMessage = document.getElementById("errorMessage");

    if (!searchInput) return;

    const searchValue = searchInput.value.trim().toLowerCase();

    if (searchValue === "") {
        if (errorMessage) errorMessage.textContent = "Please enter a meal name.";
        return;
    }

    const foundMeal = meals.find(meal =>
        meal.toLowerCase().includes(searchValue)
    );

    if (foundMeal) {
        window.location.href = "results.html?search=" + encodeURIComponent(searchValue);
    } else {
        if (errorMessage) errorMessage.textContent = "Sorry, this meal is not available.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const mealSearchInput = document.getElementById("mealSearch");
    if (mealSearchInput) {
        mealSearchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                searchMeal();
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchedMeal = urlParams.get("search");
    const resultText = document.getElementById("searchResultText");
    const mealCards = document.querySelectorAll(".meal-card");

    if (searchedMeal) {
        if (resultText) {
            resultText.textContent = "Showing meals related to: " + searchedMeal;
        }

        if (mealCards.length > 0) {
            const searchText = searchedMeal.toLowerCase();
            mealCards.forEach(card => {
                const mealName = card.getAttribute("data-name") ? card.getAttribute("data-name").toLowerCase() : "";
                if (mealName.includes(searchText)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        }
    }

    if (document.getElementById("mealContent")) {
        displayMeal();
    }
});

function openMeal(mealName) {
    localStorage.setItem("selectedMeal", mealName);
    window.location.href = "meal.html";
}

async function getRecipe(mealName) {
    try {
        const response = await fetch(THEMEALDB_API + encodeURIComponent(mealName));
        const data = await response.json();
        return data.meals;
    } catch (error) {
        console.error("TheMealDB API Error:", error);
        return null;
    }
}

async function displayMeal() {
    const mealContent = document.getElementById("mealContent");
    if (!mealContent) return;

    const mealName = localStorage.getItem("selectedMeal");

    if (!mealName) {
        mealContent.innerHTML = `<p>Meal not selected.</p>`;
        return;
    }

    mealContent.innerHTML = `<p>Loading recipe...</p>`;

    const fetchedMeals = await getRecipe(mealName);

    if (!fetchedMeals || fetchedMeals.length === 0) {
        mealContent.innerHTML = `<p>Recipe not found for ${mealName}.</p>`;
        return;
    }

    const meal = fetchedMeals[0];

    mealContent.innerHTML = `
        <div class="meal-detail-card">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="meal-detail-info">
                <p class="small-title">BITE & BALANCE</p>
                <h1>${meal.strMeal}</h1>
                <p class="meal-category">Category: ${meal.strCategory || "N/A"}</p>
                <p class="meal-area">Cuisine: ${meal.strArea || "N/A"}</p>
                
                <div class="meal-buttons">
                    <button onclick="showRecipe()">Recipe</button>
                    <button onclick="getNutrition()">Nutritional Value</button>
                </div>

                <div id="recipeText" class="recipe-box" style="margin-top: 15px; display: none;"></div>
                <div id="nutritionText" class="nutrition-box" style="margin-top: 15px; display: none;"></div>
            </div>
        </div>
    `;

    localStorage.setItem("currentRecipe", JSON.stringify(meal));
}

function showRecipe() {
    const recipeBox = document.getElementById("recipeText");
    const nutritionBox = document.getElementById("nutritionText");

    if (!recipeBox) return;
    if (nutritionBox) nutritionBox.style.display = "none";

    const recipe = JSON.parse(localStorage.getItem("currentRecipe"));

    if (!recipe) {
        recipeBox.innerHTML = `<p>Recipe information is not available.</p>`;
        return;
    }

    recipeBox.innerHTML = `
        <h2>Recipe Instructions</h2>
        <p style="white-space: pre-line;">${recipe.strInstructions}</p>
    `;
    recipeBox.style.display = "block";
}

async function getNutritionData(foodName) {
    try {
        const response = await fetch(`${FOODDATA_API}?api_key=${FOODDATA_API_KEY}&query=${encodeURIComponent(foodName)}`);
        const data = await response.json();
        return data.foods;
    } catch (error) {
        console.error("FoodData API Error:", error);
        return null;
    }
}

async function getNutrition() {
    const nutritionBox = document.getElementById("nutritionText");
    const recipeBox = document.getElementById("recipeText");

    if (!nutritionBox) return;
    if (recipeBox) recipeBox.style.display = "none";

    const mealName = localStorage.getItem("selectedMeal");
    if (!mealName) return;

    nutritionBox.innerHTML = `<p>Loading nutritional information...</p>`;
    nutritionBox.style.display = "block";

    const foods = await getNutritionData(mealName);

    if (!foods || foods.length === 0) {
        nutritionBox.innerHTML = `<p>Nutritional information not found.</p>`;
        return;
    }

    const food = foods[0];

    nutritionBox.innerHTML = `
        <h2>Nutritional Value (per 100g approx)</h2>
        <p><strong>Food:</strong> ${food.description}</p>
        <p><strong>Calories:</strong> ${getNutrient(food, "Energy")} kcal</p>
        <p><strong>Protein:</strong> ${getNutrient(food, "Protein")} g</p>
        <p><strong>Fat:</strong> ${getNutrient(food, "Total lipid (fat)")} g</p>
        <p><strong>Carbohydrates:</strong> ${getNutrient(food, "Carbohydrate, by difference")} g</p>
    `;
}

function getNutrient(food, nutrientName) {
    if (!food.foodNutrients) return "N/A";
    const nutrient = food.foodNutrients.find(item => item.nutrientName.includes(nutrientName));
    return nutrient ? nutrient.value : "N/A";
}
