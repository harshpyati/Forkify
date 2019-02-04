import axios from 'axios';
import {key,proxy} from '../config';
export default class Recipe{
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            const result = await axios(
                `${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`
            );
            this.title = result.data.recipe.title;
            this.author = result.data.recipe.publisher;
            this.img = result.data.recipe.image_url;
            this.url = result.data.recipe.source_url;
            this.ingredients = result.data.recipe.ingredients;
            //console.log(result);
        }catch(e){
            console.log(e);
            alert('Something went wrong');
        }
    }

    calcTime(){
        // Assume that we need 15 mins for each 3 ingredients
        const numIng = this.ingredients.length;
        const period = Math.ceil(numIng / 3);
        this.time = period * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const unitsLong = ['tablespoons','tablespoon','ounce','ounces','teaspoon','teaspoons','cups','pounds'];
        const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
        const units = [...unitsShort,'kg','g'];
        const newIngredients = this.ingredients.map(el => {
            // 1. Uniform Units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit,i) => {
                ingredient = ingredient.replace(unit,unitsShort[i]);
            });
            // 2. Remove Parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\)*/g,' ');
            // 3. Parse Ingredients into count, unit and ingredient
            
            // 1. Conver the ingredient into array to find the index where the unit is located
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el => units.includes(el));
            
            let objIng;

            if(unitIndex > -1){
                // There is a unit
                const arrCount = arrIng.slice(0,unitIndex);

                let count;
                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-','+'));
                }else{
                    count = eval(arrCount.join('+'));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
            }else if(unitIndex === -1){
                // There is no unit, and the 1st element is not a number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }else if(parseInt(arrIng[0],10)){
                // There is no unit, but 1st element is number, for ex: 1 bread
                objIng = {
                    count: parseInt(arrIng[0],10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }
            return objIng;
        });

        this.ingredients = newIngredients;
    }

    updateServings(type) {
        // Servings
        const newServings = type === 'dec'? this.servings - 1: this.servings + 1;
        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        })
        this.servings = newServings;
        //console.log(this.servings);
    }
}