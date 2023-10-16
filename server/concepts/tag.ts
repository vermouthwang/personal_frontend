import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { ChannelDoc } from "./channel";
import { NotFoundError } from "./errors";
import { EventDoc } from "./event";
import { MessageDoc } from "./message";
import { PostDoc } from "./post";
import { UserDoc } from "./user";

// concept Tag [Item (a generic type)]
// 	purpose
// 		organize and show the new created item to users
// 	principle
// 		when a new item of content is created, it should be
// 		categorized and taged with a set of labels(strings)
// 	state
// 		label: Item -> set String
// 	actions
//      addTag (item: Item, label: String)
//      searchTag (label: String)
//      removeTag (label: String)
//      getAllTags ()
//      getItems (label: String)
//      gettagByLabel (label: String)

// a helper function to check if the given id is in the obejctid list
export function toString_listcompare(id: ObjectId, ObjectIdlist: ObjectId[]) {
  //using toString to compare the ObjectId
  const string_id = id.toString();
  let _isInthelist = false;
  for (let i = 0; i < ObjectIdlist.length; i++) {
    if (string_id === ObjectIdlist[i].toString()) {
      _isInthelist = true;
      break;
    }
  }
  return _isInthelist;
}
// Data model for Tag
export interface TagDoc extends BaseDoc {
  label: string; // name of the tag
  items: ObjectId[]; // list of items with this tag
  privacy: "public_label" | "private_label"; // if the tag is private
}

// concept class
export default class TagConcept<T extends UserDoc | PostDoc | ChannelDoc | EventDoc | MessageDoc> {
  public readonly tags = new DocCollection<TagDoc>("tags");

  async addTag(l: string, privacy: "public_label" | "private_label") {
    //firstly check if the tag already exists
    const the_tag = await this.searchTag(l, privacy);
    if (the_tag !== null) {
      //if the tag exists, add the item to the tag
      throw new NotFoundError(`Tag already exists!`);
    } else {
      const _id = await this.tags.createOne({ label: l, items: [], privacy });
      return { msg: "Tag created successfully!", tag: await this.tags.readOne({ _id }) };
    }
  }

  async addItemtoTag(i: ObjectId, tag: ObjectId) {
    const the_tag = await this.tags.readOne({ _id: tag });
    // push the item into the items property of the tag
    if (the_tag === null) {
      throw new NotFoundError(`Tag not found!`);
    }
    if (await this.verifyifIteminTag(i, tag)) {
      throw new NotFoundError(`Item already in the tag!`);
    }
    the_tag.items.push(i);
    // update the tag
    await this.tags.updateOne({ _id: tag }, the_tag);
    return { msg: "Item added successfully!", tag: the_tag };
  }

  async verifyifIteminTag(item: ObjectId, tag: ObjectId) {
    const the_tag = await this.tags.readOne({ _id: tag });
    if (the_tag === null) {
      throw new NotFoundError(`Tag not found!`);
    }
    const items = the_tag.items;
    //using toString to compare the ObjectId
    return toString_listcompare(item, items);
  }

  async searchTagbyId(_id: ObjectId) {
    const the_tag = await this.tags.readOne({ _id });
    if (the_tag === null) {
      throw new NotFoundError(`Tag not found!`);
    }
    return the_tag;
  }

  async searchTag(l: string, privacy: "public_label" | "private_label") {
    const the_tag = await this.tags.readOne({ label: l, privacy: privacy });
    return the_tag;
  }

  async searchTag_loose(l: string, privacy: "public_label" | "private_label") {
    const the_tag = await this.tags.readMany({ label: { $regex: l }, privacy: privacy });
    return the_tag;
  }

  //remove a tag if there is no item with this tag
  async removeTag(_id: ObjectId) {
    const the_tag = await this.tags.readOne({ _id });
    if (the_tag === null) {
      throw new NotFoundError(`Tag not found!`);
    }
    if (the_tag.items.length === 0) {
      await this.tags.deleteOne({ _id });
      return { msg: "Tag removed successfully!", tag: the_tag };
    } else {
      return { msg: "Tag cannot be removed!", tag: the_tag };
    }
  }

  async removeItemFromTag(i: ObjectId, l: string, privacy: "public_label" | "private_label") {
    //firstly check if the tag already exists
    const the_tag = await this.searchTag(l, privacy);
    if (the_tag !== null) {
      //if the tag exists, then check if the item is in the tag
      const items = the_tag.items;
      //using toString to compare the ObjectId
      if (!toString_listcompare(i, items)) {
        throw new NotFoundError(`Item is not in the tag!`);
      }
      the_tag.items = the_tag.items.filter((item) => item !== i);
      return { msg: "Item removed successfully!", tag: the_tag };
    } else {
      return { msg: "Tag not found!", tag: the_tag };
    }
  }
  //get all tags
  async getAllTags() {
    const the_tag = await this.tags.readMany({});
    return the_tag;
  }
  //get all items with this tag
  async getItems(_id: ObjectId) {
    const the_tag = await this.tags.readOne({ _id });
    if (the_tag === null) {
      throw new NotFoundError(`Tag not found!`);
    }
    return the_tag.items;
  }

  //?TODO Test // if check privacy
  async getSimilarTags(label: string) {
    //user regexFindAll
    const the_tag = await this.tags.readMany({ label: { $regexFindAll: label } });
    return the_tag;
  }
}
