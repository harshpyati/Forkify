// Import the Models
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

// Import the Views
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView';
import {elements,renderLoader,clearLoader,clearButtons} from './views/base';
import * as listView from './views/listView';
import * as likeView from './views/likeView';

// Maintaining the state of the app
/* 
    -Search object
    -Current Recipe object
    -Shopping list object
    -Liked recipes
*/
const state = {

};

const controlSearch = async() => {
    // 1. Get the query from the view
    const query = searchView.getInput();
    console.log(query);
    if(query){
        // 2. New search object and add it to the state
        state.search = new Search(query);
        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        //elements.searchResPage.insertAdjacentHTML = '';
        renderLoader(elements.searchRes);
        // 4. Search for recipes
        try{
            await state.search.getResults();
            //state.recipe.parseIngredients();
            // 5. Render elements on UI
            clearLoader();
            //clearButtons();
            searchView.renderResults(state.search.result);
        }catch(err){
            console.log(err);
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPage.addEventListener('click',e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults()
        searchView.renderResults(state.search.result,goToPage);
    }
});

/* RECIPE CONTROLLER*/
const controlRecipe = async() => {
    const id = window.location.hash.replace('#','');
    console.log(`Id is : ${id}`);
    if(id){
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe); 

        // Highlight Selected
        if(state.search)searchView.highlightSelected(id);

        // Create new Recipe Object
        state.recipe = new Recipe(id);

        // Get Recipe data
        try{
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        }catch(error){
            console.log('Error Processing the recipe');
        }
    }
};
// There is an event listener which fires up everytime the # part of the url changes
// window.addEventListener('hashchange',controlRecipe);
// window.addEventListener('load',controlRecipe);

['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));

/* LIST CONTROLLER */
const controlList = () => {
    if(!state.list) state.list = new List();
    window.list = state.list;
    // Add each ingredients to the List and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count,el.unit,el.ingredient); 
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click',e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // Handle delete item
    if(e.target.matches('.shopping__delete,.shopping__delete *')){
        // delete from state
        state.list.deleteItem(id);
        // delete from UI
        listView.deleteItem(id);
      // Handle Update event  
    }else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value,10);
        state.list.updateCount(id,val);
    }
});
state.likes = new Likes();
/* LIKE CONTROLLER */
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    // User has NOT yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        // Add Like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likeView.toggleLikedBtn(true);
        // Add like to the UI list
        likeView.renderLike(newLike);
    // User has NOT yet liked current recipe
    }else{
        // Remove like from the state
        state.likes.deleteLikes(currentID);
        // Toggle the like button
        likeView.toggleLikedBtn(false);
        // Remove like from UI list
        likeView.deleteLike(currentID);
    }

    likeView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes
window.addEventListener('load',() => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle Like menu button
    likeView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => {
        likeView.renderLike(like);
    })
}); 

// Handling recipe button clicks
elements.recipe.addEventListener('click',e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase,.btn-increase *')){
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn--add,.recipe__btn--add *')){
         // call the control list function
         // Add item to the ingredient lists
         controlList();
    }else if(e.target.matches('.recipe__love,.recipe__love *')){
        controlLike();
    }
});

// Suggestions
/*
    1. Button to delete all shopping list items
    2. Implement functionality to manually add items to shopping list
    3. Save shopping list data in local storage
    4. Improve the ingredient parsing algo
    5. Come up with an algorithm for calculating the amount of servings
    6. Improve error handling
*/
