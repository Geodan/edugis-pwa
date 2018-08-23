
/* 

   Function to create and manage collapsible groups of similar item objects in 1D Array of items 
   Item similarity is defined by one or more keys
   Collapsible groups are inserted as group items in Array
   Array dimension (1) and item order are not modified

*/


class Sequence {
    constructor(start) {
        this._counter = (start ? start : 1);
    }
    get next(){
        return this._counter++;
    }
}

const idGenerator = new Sequence();

class GroupedArray {
    constructor (groupKeys) {
        this._items = [];
        this._levelCount = groupKeys.length;
        this._groupKeys = groupKeys;
    }
    get items() {
        return [...this._items];
    }
    set items(list) {
        this._items = [];
        for (let i = 0; i < list.length; i++) {
            this.pushItem(list[i]);
        }
    }
    _tagItem(item) {
        if (!item.ga_id) {
            item._ga_id = String(idGenerator.next);
        }
        return item;
    }
    insertAboveItemIndex(item, aboveItemIndex) {
        this._tagItem(item);
        if (aboveItemIndex > -1 && aboveItemIndex < this._items.length) {
            const nextItem = this._items[aboveItemIndex]
            if (nextItem._ga_group) {
                // nextItem is a groupItem
                if (item[nextItem._ga_group] && (item[nextItem._ga_group[0]] == nextItem[nextItem._ga_group[0]])) {
                    // item should be added to this group
                    this._items.splice(aboveItemIndex, 0, item);
                    return;
                } else {
                    // item does not belong to the group
                    this._items.splice(aboveItemIndex + 1, 0, item);
                    return;
                }
            } else {
                let matchDepth = 0;
                let keys = [];
                for (let i = 0; i < this._levelCount; i++) {
                    const key = this._groupKeys[i];
                    if (item.hasOwnProperty(key) && nextItem.hasOwnProperty(key) && (item[key] == nextItem[key])) {
                        matchDepth++;
                        keys.push(key);
                    } else {
                        break;
                    }
                }
                if (matchDepth > 0) {
                    // item should be in group
                    item._ga_depth = matchDepth;
                    if (aboveItemIndex + 1 < this._items.length) {
                        const belowItem = this._items[aboveItemIndex + 1];
                        if (belowItem.hasOwnProperty(key) && (item[key] == belowItem[key])) {
                            // insert item in existing group
                            this._items.splice(aboveItemIndex + 1, 0, item);
                            return;
                        }
                    }
                    this._items.splice(aboveItemIndex + 1, 0, item);
                    // create group
                    const groupItem = this._tagItem({_ga_group: keys});
                    keys.forEach(key => groupItem[key] = item[key]);
                    this._items.splice(aboveItemIndex + 2, 0, groupItem);
                    return;
                }
            }
        }
        this._items.push(item);
    }
    insertAbove(item, aboveItem) {
        if (aboveItem && aboveItem._ga_id) {
            const aboveItemIndex = this._items.findIndex(searchItem=>searchItem._ga_id === aboveItem._ga_id);
            this.insertAboveItemIndex(item, aboveItemIndex);
        } else {
            this.insertAboveItemIndex(item, -1);
        }
    }
    pushItem(item) {
        this.insertAboveItemIndex(item, this._items.length - 1);
    }
    removeItem(item) {

    }
    openGroup(itemIndex) {

    }
    closeGroup(itemIndex) {

    }
    moveItem (fromIndex, toIndex) {

    }
    _createGroup() {

    }
    _removeGroup() {

    }
};


function test() {
    const list = 
    [
        {"id":"background" },
        {"id": "wfs1", "source": "wfsource"},
        {"id": "wfs2", "source": "wfsource"},
        {"id":"layer_1", "source":"openmaptiles", "source-layer": "text" },
        {"id":"layer_2", "source":"openmaptiles", "source-layer": "text" },
        {"id":"layer_3", "source":"openmaptiles", "source-layer": "other" },
        {"id":"layer_4", "source":"openmaptiles", "source-layer": "text" },
        {"id":"layer_5", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"layer_6", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"layer_7", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"layer_8", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"wms", "source":"othersource", "source-layer": "text" }
    ];

    let groupedArray = new GroupedArray(["source", "source-layer"]);
    groupedArray.items = list;
    const result = groupedArray.items;
    for (i = 0; i < result.length; i++) {
        console.log(result[i]);
    }
}

test();