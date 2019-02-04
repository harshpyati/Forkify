import uniqid from 'uniquid';
export default class List{
    constructor(){
        this.items = [];
    }

    addItem(count,unit,ingredient){
        const item = {
            id:uniqid(), 
            count,
            unit,
            ingredient
        };

        this.items.push(item);
        //console.log(this.items);
        return item;
    }

    deleteItem(id){
        // [2,4,8] splice(1,1) -> returns 4, og array is [2,8]
        // [2,4,8] slice(1,1) -> returns 4, og array is [2,4,8]
        const index = this.items.findIndex(el => el.id === id);
        this.items.splice(index,1);
    }

    updateCount(id,newCount){
        this.items.find(el => el.id === id).count = newCount; 
    }
}