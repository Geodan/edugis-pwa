
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
        if (groupKeys) {
            this._levelCount = groupKeys.length;
            this._groupKeys = groupKeys;
        } else {
            this._levelCount = 0;
            this._groupKeys = [];
        }
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
    _matchItem(item1, item2) {
        let i = 0;
        for (i = 0; i < this._levelCount; i++) {
            const key = this._groupKeys[i];
            if (!(item1.hasOwnProperty(key) && item2.hasOwnProperty(key) && (item1[key] ==item2[key]))) {
                return i;
            }
        }
        return i;
    }
    insertAboveItemIndex(item, itemBelowIndex) {
        this._tagItem(item);
        if (itemBelowIndex > -1 && itemBelowIndex < this._items.length) {
            const itemBelow = this._items[itemBelowIndex];
            let matchDepth = this._matchItem(item, itemBelow);
            let aboveMatchDepth = 0;
            let itemAbove;
            if (itemBelowIndex + 1 < this._items.length) {
                // check match depth with item above
                itemAbove = this._items[itemBelowIndex + 1];
                aboveMatchDepth = this._matchItem(item, itemAbove);
            }
            if (matchDepth > 0 && matchDepth >= aboveMatchDepth) {
                // item should be grouped with item below
                if (itemBelow._ga_group) {
                    // itemBelow is a groupItem
                    if (itemBelow._ga_depth <= matchDepth) {
                        // recursively add item below the group
                        this.insertAboveItemIndex(item, itemBelowIndex - 1);
                        return;
                    }
                }
                // check item above
                if (aboveMatchDepth == matchDepth) {
                    // insert item in existing group
                    this._items.splice(itemBelowIndex + 1, 0, item);
                    return;
                }
                // add item
                this._items.splice(itemBelowIndex + 1, 0, item);
                // create new group above item
                const groupItem = this._tagItem({_ga_group: true, _ga_depth: matchDepth});
                for (let i = 0; i < matchDepth; i++) {
                    groupItem[this._groupKeys[i]] = item[this._groupKeys[i]];
                }
                this._items.splice(itemBelowIndex + 2, 0, groupItem);
                return;
            } else {
                if (itemBelowIndex + 1 < this._items.length) {
                    if (aboveMatchDepth > 0) {
                        // item should be grouped with item(s) above
                        // replace above item with this item
                        this._items[itemBelowIndex + 1] = item;
                        // recursively insert above item above this item
                        this.insertAboveItemIndex(itemAbove, itemBelowIndex + 1);
                        return;
                    }
                }
            }
        }
        this._items.push(item);
    }
    insertAbove(item, itemBelow) {
        if (itemBelow && itemBelow._ga_id) {
            const belowItemIndex = this._items.findIndex(searchItem=>searchItem._ga_id === itemBelow._ga_id);
            this.insertAboveItemIndex(item, belowItemIndex);
        } else {
            this.insertAboveItemIndex(item, -1);
        }
    }
    pushItem(item) {
        this.insertAboveItemIndex(item, this._items.length - 1);
    }
    removeItem(item) {
        const itemIndex = this.items.findIndex(searchItem=>searchItem._ga_id == item._ga_id);
        if ((itemIndex > -1) && !this.item[groupIndex]._ga_group && this.items[itemIndex]._ga_visible) {
            // check if this item is part of group of 2 items
            // Todo
        }
    }
    _updateGroup(item, isOpen) {
        const groupIndex = this.items.findIndex(searchItem=>searchItem._ga_id == item._ga_id);
        if ((groupIndex > -1) && this.items[groupIndex]._ga_group && this.items[groupIndex]._ga_visible) {
            // found
            const group = this.items[groupIndex];
            group._ga_open = isOpen;
            for (let i = groupIndex - 1; i > -1; i--) {
                const item = this.items[i];
                if (this._matchItem(group, item) < group._ga_depth) {
                    // end of group
                    return;
                }
                this.items[i]._ga_visible = isOpen;
                if (this.items[i]._ga_id) {
                    // subgroup, skip
                    let subgroup = this.items[i];
                    for (i = i - 1; i > -1; i--) {
                        if (this._matchItem(subgroup, this.items[i]) != subgroup._ga_depth) {
                            i++;
                            break;
                        }
                    }
                }
            }
        }
    }
    openGroup(item) {
        this._updateGroup(item, true);
    }
    closeGroup(item) {
        this._updateGroup(item, false);
    }
    moveItem (fromIndex, toIndex) {
        // Todo
        // remove item or group
        // add item or group
    }
    collapseAll() {
        // sets all grouped items to invisible
        let currentGroup = {};
        for (let i = this.items.length - 1; i > -1; i--)
        {
            const item = this.items[i];
            if (item._ga_group) {
                item._ga_open = false;
            }
            if (this._groupKeys.length) {
                if (currentGroup[this._groupKeys[0]] && item[this._groupKeys[0]] && currentGroup[this._groupKeys[0]] == item[this._groupKeys[0]]) {
                    item._ga_visible = false;
                } else {
                    item._ga_visible = true;
                    if (item._ga_group) {
                        currentGroup = item;
                    } else {
                        currentGroup = {}
                    }
                }
            } else {
                item._ga_visible = true;
            }
        }
    }
};

export default GroupedArray;

function test() {
    const list = 
    [
        {"id":"background" },
        {"id": "wfs1", "source": "wfsource"},
        {"id": "wfs2", "source": "wfsource"},
        {"id":"layer_1", "source":"openmaptiles", "source-layer": "text" },
        {"id":"layer_2", "source":"openmaptiles", "source-layer": "text" },
        {"id":"layer_3", "source":"openmaptiles", "source-layer": "other" },
        {"id":"layer_3", "source":"openmaptiles", "source-layer": "other" },
        {"id":"layer_4", "source":"openmaptiles", "source-layer": "text" },
        {"id":"layer_4", "source":"openmaptiles", "source-layer": "nieuw" },
        {"id":"layer_5", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"layer_6", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"layer_7", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"layer_8", "source":"openmaptiles", "source-layer": "plain" },
        {"id":"wms", "source":"othersource", "source-layer": "text" }
    ];

    let groupedArray = new GroupedArray(["source", "source-layer"]);
    groupedArray.items = list;
    const aboveItem = groupedArray.items[9];
    groupedArray.insertAbove({"id":"newlayer", "source": "openmaptiles", "source-layer":"text"}, aboveItem);
    groupedArray.collapseAll();
    groupedArray.openGroup(groupedArray.items[19]);
    groupedArray.closeGroup(groupedArray.items[19]);
    const result = groupedArray.items;
    for (let i = 0; i < result.length; i++) {
        console.log(result[i]);
    }
}

test();