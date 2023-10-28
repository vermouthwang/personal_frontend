import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { ChannelDoc } from "./channel";
import { NotFoundError } from "./errors";

/**
 * concept LocalAccess [Item]
novel concept that guards access by location
can be applied by sync to channels and other things
purpose: limited access to channels and other things by location
principle
  after an item is created, give it a location, and a expiration time
  after the expiration time, the access to the item is revoked
state
  loation: one Item -> one Location
  expiration: one Item -> one Time
actions
  giveLocation (item: Item, location: Location)
  giveExpiration (item: Item, time: Time)
  getLocation (item: Item, location: Location)
  getExpiration (item: Item, time: Time)
  revokeAccess (item: Item)
  isAccessable (item: Item, location: Location, time: Time)
 */

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
export function getGeolocation(latitude?: number, longtitude?: number) {
  // not implemented yet
  // will using google map api in the next assignment
  if (latitude !== undefined && longtitude !== undefined) {
    return { lat: latitude, long: longtitude };
  }
  // now hard-coded // return randomly a tuple of latitude(42,43) and longitude(-71,-72)
  return { lat: Math.random() * 0.05 + 42.3617, long: -Math.random() * 0.05 - 71.0895 };
  // return { lat: Math.floor(Math.random() * 180) - 90, long: Math.floor(Math.random() * 360) - 180 };
}
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // not implemented yet
  // will be completed after figur out the google map api in the next assignment
  // return the euclidean distance between two points
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
}

//datamodel
export interface LocalAccessDoc extends BaseDoc {
  name: string; // name of the access object
  accessobject: ObjectId; // at current time it should be a channel which has limited access
  // item: ObjectId; // at current time it should be a user
  location: { lat: number; long: number }; // the location of the access object
  expiration: number; //the time after which the access is revoked (counting in hours, ex: 24hours)
  item_timein: item_timeinDoc[]; // the item in the access object and the time when it is in
}

export interface item_timeinDoc extends BaseDoc {
  item: ObjectId;
  timein: Date;
}

export default class LocalAccessConcept<T extends ChannelDoc> {
  public readonly localaccess = new DocCollection<LocalAccessDoc>("localaccess");
  public readonly item_timein = new DocCollection<item_timeinDoc>("item_timein");

  async createAccessObject(name: string, object: T, expiration: number, location: { lat: number; long: number }) {
    const accessobject = object._id;
    // check if the access object already exists
    const existing = await this.localaccess.readOne({ name });
    if (existing !== null) {
      throw new Error(`Access object already exists!`);
    }
    const the_location = getGeolocation(location.lat, location.long);
    const _id = await this.localaccess.createOne({ name, accessobject, expiration, location: the_location, item_timein: [] });
    const the_accessobject = await this.localaccess.readOne({ _id });
    if (the_accessobject !== null) {
      return { msg: "Access object created successfully!", accessobject: the_accessobject };
    } else {
      throw new Error(`Cant create`);
    }
  }

  async getAccessObject(name: string) {
    const accessobject = await this.localaccess.readOne({ name });
    if (accessobject !== null) {
      return { msg: "Access object found!", accessobject };
    } else {
      //display the $name in the error message
      throw new NotFoundError(`Access object not found! ${name}`);
    }
  }
  async putiteminaccessobject(name: string, item: ObjectId) {
    const accessobject = await this.localaccess.readOne({ name });
    if (accessobject !== null) {
      const itemsinObject = accessobject.item_timein;
      const timein = new Date();
      //create a new item_timeinDoc and push it into the item_timein array
      const item_timein_id = await this.item_timein.createOne({ item, timein });
      const this_item_timein = await this.item_timein.readOne({ _id: item_timein_id });
      if (this_item_timein === null) {
        throw new Error(`Cant create item_timeinDoc!`);
      }
      itemsinObject.push(this_item_timein);
      await this.localaccess.updateOne({ _id: accessobject._id }, { item_timein: itemsinObject });
      console.log(accessobject);
      return { msg: "Item put in access object successfully!", accessobject };
    } else {
      throw new Error(`Cant find the access object!`);
    }
  }
  async removeitemfromaccessobject(name: string, item: ObjectId) {
    console.log("removeitemfromaccessobject");
    const accessobject = await this.localaccess.readOne({ name });
    if (accessobject !== null) {
      const itemsinObject = accessobject.item_timein;
      const item_timein = itemsinObject.find((item_timein) => item_timein.item.toString() === item.toString());
      if (item_timein !== undefined) {
        //remove the item from the access object
        //the_channel.members = the_channel.members.filter((member) => member.toString() !== user.toString());
        await this.localaccess.updateOne({ _id: accessobject._id }, { item_timein: itemsinObject.filter((item_timein) => item_timein.item.toString() !== item.toString()) });
        // await this.item_timein.deleteOne({ _id: item_timein._id });
        return { msg: "Item removed from access object successfully!", accessobject };
      } else {
        throw new NotFoundError(`original not in`);
      }
    }
  }
  //update the item_timeinDoc in the access object by reasign the timein as now
  async updateitemwithtime(name: string, item: ObjectId) {
    const accessobject = await this.localaccess.readOne({ name });
    if (accessobject !== null) {
      const itemsinObject = accessobject.item_timein;
      const item_timein = itemsinObject.find((item_timein) => item_timein.item.toString() === item.toString());
      if (item_timein !== undefined) {
        const timein = new Date();
        await this.item_timein.updateOne({ _id: item_timein._id }, { timein });
        return { msg: "Time update succesful!", accessobject };
      } else {
        throw new NotFoundError(`original not in`);
      }
    }
  }
  async authorizeJoin(name: string, item: ObjectId) {
    // check if the item is allowed to join the access object
    // based on their location // currently only happend when users join a channel
    // return a boolean
    const accessobject = await this.localaccess.readOne({ name });
    //return randomly a tuple of latitude(42,43) and longitude(-71,-72) for the user location
    const item_location = { lat: 42.361311, long: -71.09204 };
    if (accessobject !== null) {
      const objectlocation = accessobject.location;
      // calculate the distance between the item and the access object
      const distance = getDistance(objectlocation.lat, objectlocation.long, item_location.lat, item_location.long);
      if (distance < 0.0027) {
        return true;
      }
    }
    return false;
  }
  async getallobject() {
    const all_object = await this.localaccess.readMany({});
    return all_object;
  }

  async checkifexpired(name: string, item: ObjectId) {
    //check if the item in the access object is expired
    //return a boolean (true if expired)
    const accessobject = await this.localaccess.readOne({ name });
    if (accessobject === null) {
      throw new Error(`Cant find the access object!`);
    }
    const itemsinObject = accessobject.item_timein;
    const item_timein = itemsinObject.find((item_timein) => item_timein.item.toString() === item.toString());
    if (item_timein !== undefined) {
      const the_time_itemin = item_timein.timein;
      const now = new Date();
      const diff = now.getTime() - the_time_itemin.getTime();
      const hours = diff / (1000 * 60 * 60);
      if (hours > accessobject.expiration) {
        await this.item_timein.deleteOne({ _id: item_timein._id });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  async getRemainTime(name: string, item: ObjectId) {
    //get the remain time of the item in the access object
    //return a number (hours)
    const accessobject = await this.localaccess.readOne({ name });
    if (accessobject === null) {
      throw new Error(`Cant find the access object!`);
    }
    const itemsinObject = accessobject.item_timein;
    const item_timein = itemsinObject.find((item_timein) => item_timein.item.toString() === item.toString());
    if (item_timein !== undefined) {
      const the_time_itemin = item_timein.timein;
      const now = new Date();
      const diff = now.getTime() - the_time_itemin.getTime();
      const remainhours = accessobject.expiration - diff / (1000 * 60 * 60);
      // return the reamin hour with 1 decimal place
      return Math.round(remainhours * 10) / 10;
    } else {
      throw new NotFoundError(`no channel found`);
    }
  }
}
