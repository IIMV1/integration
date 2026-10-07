/* =========================================
   BITE & BALANCE - JAVASCRIPT
========================================= */


/* =========================================
   1. OUR MEALS
========================================= */

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


/* =========================================
   2. SEARCH FROM HOME PAGE
========================================= */

function searchMeal() {

    const searchInput =
        document.getElementById("mealSearch");

    const errorMessage =
        document.getElementById("errorMessage");


    if (!searchInput) {
        return;
    }


    const searchValue =
        searchInput.value.trim().toLowerCase();


    if (searchValue === "") {

        errorMessage.textContent =
            "Please enter a meal name.";

        return;
    }


    const foundMeal = meals.find(meal =>
        meal.toLowerCase().includes(searchValue)
    );


    if (foundMeal) {

        window.location.href =
            "results.html?search=" +
            encodeURIComponent(searchValue);

    } else {

        errorMessage.textContent =
            "Sorry, this meal is not available.";

    }

}


/* =========================================
   3. ENTER KEY FOR SEARCH
========================================= */

const mealSearchInput =
    document.getElementById("mealSearch");


if (mealSearchInput) {

    mealSearchInput.addEventListener(
        "keypress",
        function(event) {

            if (event.key === "Enter") {

                searchMeal();

            }

        }
    );

}


/* =========================================
   4. RESULTS PAGE
========================================= */

const urlParams =
    new URLSearchParams(window.location.search);

const searchedMeal =
    urlParams.get("search");


const resultText =
    document.getElementById("searchResultText");


if (resultText && searchedMeal) {

    resultText.textContent =
        "Showing meals related to: " +
        searchedMeal;

}


/* =========================================
   5. FILTER THE 10 MEALS
========================================= */

const mealCards =
    document.querySelectorAll(".meal-card");


if (mealCards.length > 0 && searchedMeal) {

    const searchText =
        searchedMeal.toLowerCase();


    mealCards.forEach(card => {

        const mealName =
            card.dataset.name.toLowerCase();


        if (mealName.includes(searchText)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}


/* =========================================
   6. OPEN SELECTED MEAL
========================================= */

function openMeal(mealName) {

    /*
       Save the selected meal
       so meal.html knows which meal
       the user selected.
    */

    localStorage.setItem(
        "selectedMeal",
        mealName
    );


    /*
       Go to the meal details page.
    */

    window.location.href =
        "meal.html";

}


/* =========================================
   7. THEMEALDB API
========================================= */

/*
   TheMealDB API
   This is where we get the recipe.
*/

const THEMEALDB_API =
    "https://www.themealdb.com/api/json/v1/1/search.php?s=";


async function getRecipe(mealName) {

    try {

        const response = await fetch(
            THEMEALDB_API +
            encodeURIComponent(mealName)
        );


        const data =
            await response.json();


        return data.meals;


    } catch (error) {

        console.error(
            "TheMealDB API Error:",
            error
        );


        return null;

    }

}


/* =========================================
   8. DISPLAY MEAL FROM THEMEALDB
========================================= */

async function displayMeal() {

    const mealContent =
        document.getElementById("mealContent");


    /*
       Only run this function
       on meal.html
    */

    if (!mealContent) {

        return;

    }


    const mealName =
        localStorage.getItem(
            "selectedMeal"
        );


    if (!mealName) {

        mealContent.innerHTML = `
            <p>Meal not found.</p>
        `;

        return;

    }


    /*
       Show loading message
    */

    mealContent.innerHTML = `
        <p>Loading recipe...</p>
    `;


    /*
       Get recipe from TheMealDB
    */

    const meals =
        await getRecipe(mealName);


    if (!meals || meals.length === 0) {

        mealContent.innerHTML = `
            <p>
                Recipe not found.
            </p>
        `;

        return;

    }


    /*
       Get the first matching recipe
    */

    const meal =
        meals[0];


    /*
       Display the recipe information
    */

    mealContent.innerHTML = `

        <div class="meal-detail-card">

            <img
                src="${meal.strMealThumb}"
                alt="${meal.strMeal}"
            >


            <div class="meal-detail-info">

                <p class="small-title">
                    BITE & BALANCE
                </p>


                <h1>
                    ${meal.strMeal}
                </h1>


                <p class="meal-category">
                    Category:
                    ${meal.strCategory || "N/A"}
                </p>


                <p class="meal-area">
                    Cuisine:
                    ${meal.strArea || "N/A"}
                </p>


                <div class="meal-buttons">

                    <button
                        onclick="showRecipe()"
                    >
                        Recipe
                    </button>


                    <button
                        onclick="getNutrition()"
                    >
                        Nutritional Value
                    </button>

                </div>


                <div
                    id="recipeText"
                    class="recipe-box"
                ></div>


                <div
                    id="nutritionText"
                    class="nutrition-box"
                ></div>

            </div>

        </div>

    `;


    /*
       Save the recipe information
       for the Recipe button.
    */

    localStorage.setItem(
        "currentRecipe",
        JSON.stringify(meal)
    );

}


/* =========================================
   9. SHOW RECIPE
========================================= */

function showRecipe() {

    const recipeBox =
        document.getElementById(
            "recipeText"
        );


    if (!recipeBox) {

        return;

    }


    const recipe =
        JSON.parse(
            localStorage.getItem(
                "currentRecipe"
            )
        );


    if (!recipe) {

        recipeBox.innerHTML = `
            <p>
                Recipe information is not available.
            </p>
        `;

        return;

    }


    recipeBox.innerHTML = `

        <h2>Recipe</h2>

        <p>
            ${recipe.strInstructions}
        </p>

    `;

}


/* =========================================
   10. FOODDATA CENTRAL API
========================================= */

/*
   WE WILL CONNECT FOODDATA CENTRAL HERE.

   Later we will replace YOUR_API_KEY
   with your real API key.
*/


const FOODDATA_API =
    "https://api.nal.usda.gov/fdc/v1/foods/search";


const FOODDATA_API_KEY =
    "YOUR_API_KEY";


async function getNutrition(foodName) {

    /*
       This function will search
       FoodData Central for the meal.
    */

    try {

        const response = await fetch(

            FOODDATA_API +
            "?api_key=" +
            FOODDATA_API_KEY +
            "&query=" +
            encodeURIComponent(foodName)

        );


        const data =
            await response.json();


        return data.foods;


    } catch (error) {

        console.error(
            "FoodData Central API Error:",
            error
        );


        return null;

    }

}


/* =========================================
   11. DISPLAY NUTRITION
========================================= */

async function displayNutrition() {

    const nutritionBox =
        document.getElementById(
            "nutritionText"
        );


    if (!nutritionBox) {

        return;

    }


    const mealName =
        localStorage.getItem(
            "selectedMeal"
        );


    if (!mealName) {

        return;

    }


    nutritionBox.innerHTML = `
        <p>
            Loading nutritional information...
        </p>
    `;


    const foods =
        await getNutrition(mealName);


    if (!foods || foods.length === 0) {

        nutritionBox.innerHTML = `
            <p>
                Nutritional information not found.
            </p>
        `;

        return;

    }


    /*
       We will choose the first
       suitable FoodData Central result.
    */

    const food =
        foods[0];


    nutritionBox.innerHTML = `

        <h2>
            Nutritional Value
        </h2>

        <p>
            Food:
            ${food.description}
        </p>

        <p>
            Calories:
            ${getNutrient(
                food,
                "Energy"
            )}
            kcal
        </p>

        <p>
            Protein:
            ${getNutrient(
                food,
                "Protein"
            )}
            g
        </p>

        <p>
            Fat:
            ${getNutrient(
                food,
                "Total lipid (fat)"
            )}
            g
        </p>

        <p>
            Carbohydrates:
            ${getNutrient(
                food,
                "Carbohydrate, by difference"
            )}
            g
        </p>

    `;

}


/* =========================================
   12. GET NUTRIENT VALUE
========================================= */

function getNutrient(food, nutrientName) {

    if (!food.foodNutrients) {

        return "N/A";

    }


    const nutrient =
        food.foodNutrients.find(
            item =>
                item.nutrientName === nutrientName
        );


    if (!nutrient) {

        return "N/A";

    }


    return nutrient.value;

}


/* =========================================
   13. NUTRITION BUTTON
========================================= */

function getNutrition() {

    displayNutrition();

}


/* =========================================
   14. START MEAL PAGE
========================================= */

displayMeal();