import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { ChannelDoc } from "./channel";
import { NotFoundError } from "./errors";
import { EventDoc } from "./event";
// import { navigator } from "web-apis";
/**
 * concept Location [Item]
purpose find item by location
principle
  after Item are added using add,
    you can find nearby item using findNearby: 
state
    locations: set Location
    points: set Item -> one Location
    geographicalrange: one Location -> (lat: number, long: number)
actions
    makeLoc (name: string, points: set Item, geographicalrange: (lat: number, long: number))
    getLocationById (_id: ObjectId)
    add (location: Location, item: Item)
    findNearby (item: Item, out: points: set Item)
    remove (item: Item)
    updateLocation (item: Item, newlocation: Location)
*/
/**
 * importatnt note:
 * The location concept is now a hard-coded singleton because I haven't figure out how to use
 * the google map api (or other geo-location api) in an appropriate way
 * which will be completed in assignment 5
 */
export function transferaddresstoGeolocation(address: string) {
  //hard-coded now
  //will be completed after using google map api in assignment 5
  return { lat: Math.floor(Math.random() * 180) - 90, long: Math.floor(Math.random() * 360) - 180 };
}
export function getGeolocation(item: ObjectId) {
  // not implemented yet
  // will using google map api in the next assignment
  // now hard-coded // return randomly a tuple of latitude(-90,90) and longitude(-180,180)
  return { lat: Math.floor(Math.random() * 180) - 90, long: Math.floor(Math.random() * 360) - 180 };
}
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // not implemented yet
  // will be completed after figur out the google map api in the next assignment
  // now hard-coded // return randomly a number between 0 and 100
  return Math.floor(Math.random() * 50);
}

// Data model for Location
export interface LocationDoc extends BaseDoc {
  name: string; // name of the location
  centered_element: ObjectId; // the element that the location is centered on
  points: ObjectId[]; // list of point inside the location
  geog_location: { lat: number; long: number }; // a tuple of latitude and longitude (number, number)
}
// Data model for pre_existedgeolocation (this is for recording the existed location in the database)
export interface pre_existedgeolocationDoc extends BaseDoc {
  name: string;
  lat: number;
  long: number;
}

// concept class
export default class LocationConcept<T extends ChannelDoc | EventDoc> {
  public readonly locations = new DocCollection<LocationDoc>("locations");
  public readonly pre_existedgeolocation = new DocCollection<pre_existedgeolocationDoc>("pre_existedgeolocation");

  //make a location (this probably should be used by the admin to create a location)
  async makeLoc(name: string, centered_element: T, points: ObjectId[] = [], geog_location: { lat: number; long: number }): Promise<{ msg: string; location: LocationDoc }> {
    const centerid = centered_element._id;
    // check if the location already exists
    if (await this.checkiflocationexist(centerid)) {
      throw new NotFoundError(`Location based on this centered_element already exists!`);
    }
    const _id = await this.locations.createOne({ name, centered_element: centerid, points, geog_location });
    const the_location = await this.locations.readOne({ _id });
    // add the location to the pre_existedgeolocation collection
    await this.pre_existedgeolocation.createOne({ name, lat: geog_location.lat, long: geog_location.long });
    if (the_location !== null) {
      return { msg: "Location created successfully!", location: the_location };
    } else {
      throw new NotFoundError(`Cant create`);
    }
  }

  async checkiflocationexist(centered_element: ObjectId) {
    const the_location = await this.locations.readOne({ centered_element });
    if (the_location !== null) {
      return true;
    }
    return false;
  }
  async getlocationBycentered_element(_centered_element: ObjectId) {
    // read the location by the centered_element property and filter
    const the_location = await this.locations.readOne({ _centered_element });
    if (the_location === null) {
      throw new NotFoundError(`Location not found!`);
    }
    return the_location;
  }
  /**
   *   whenever a location is created, it should be filled with the items near them
   * action: findNearby
   * @param item
   * go through all the latitude in the pre_existedgeolocation collection
   * first calculate if the latitude distance is less than 0.1
   * then calculate if the longitude distance is less than 0.1
   * if both works, calculate the distance between the item and the location
   * if the distance is less than 10, search the name property of the location in the location collection
   * push the first item into the points property of the location in to the aim location points property
   * if the distance is larger than 10, do nothing
   */
  async findNearby(item: ObjectId) {
    // assume the item is already recorded in the locationDoc
    // get the geolocation of the item
    const item_location = await this.getlocationBycentered_element(item);
    const item_geolocation = item_location.geog_location;
    const item_latitude = item_geolocation.lat;
    const item_longitude = item_geolocation.long;
    // give a filter of latitude and longtitude when readMany in the pre_existedgeolocation collection
    const pre_existedgeolocations = await this.pre_existedgeolocation.readMany({
      lat: { $gte: item_latitude - 0.1, $lte: item_latitude + 0.1 },
      long: { $gte: item_longitude - 0.1, $lte: item_longitude + 0.1 },
    });
    // calculate the distance between the item and each nearbyitem in the the pre_existedgeolocations
    for (const pre_existedgeolocation of pre_existedgeolocations) {
      const the_location = await this.locations.readOne({ name: pre_existedgeolocation.name });
      if (the_location === null) {
        continue;
      }
      if (await this.matchlocation(item, the_location._id)) {
        the_location.points.push(item);
        // push the finded item into the points property of the location
        item_location.points.push(the_location.centered_element);
        await this.locations.updateOne({ _id: the_location._id }, the_location);
        await this.locations.updateOne({ _id: item_location._id }, item_location);
      }
    }
  }

  async getLocationById(_id: ObjectId) {
    const the_location = await this.locations.readOne({ _id });
    if (the_location === null) {
      throw new NotFoundError(`Location not found!`);
    }
    return the_location;
  }

  async getLocationByName(name: string) {
    const the_location = await this.locations.readOne({ name });
    if (the_location === null) {
      throw new NotFoundError(`Location not found!`);
    }
    return the_location;
  }
  // add item to location
  async add(location: ObjectId, item: ObjectId) {
    //get the location
    const the_location = await this.getLocationById(location);
    if (the_location === null) {
      throw new NotFoundError(`Location not found!`);
    }
    the_location.points.push(item);
  }

  // find nearby item (the item in the same location.points)
  async findlocationPoints(location: ObjectId) {
    const the_location = await this.getLocationById(location);
    if (the_location === null) {
      throw new NotFoundError(`Location not found!`);
    }
    return the_location.points;
  }

  //find which location the item is in
  async findlocation(item: ObjectId) {
    const the_location = await this.locations.readMany({ _points: { $in: item } });
    if (the_location === null) {
      throw new NotFoundError(`Item not yet assigend to any location!`);
    }
    if (the_location.length > 1) {
      throw new NotFoundError(`Item is assigned to more than one location!`);
    }
    return the_location;
  }

  //remove an item from the location
  async remove(item: ObjectId) {
    const the_location = await this.findlocation(item);
    the_location[0].points = the_location[0].points.filter((point) => point !== item);
    //await this.locations.updateOne({ _id: the_location[0]._id }, the_location[0]);
  }

  //change the item location by remove it from the previous locationlist
  //and add it to a new one
  async updatelocation(item: ObjectId, newlocation: ObjectId) {
    await this.remove(item);
    await this.add(newlocation, item);
    return { msg: "Get to a New Location!", location: await this.locations.readOne({ _id: newlocation }) };
  }

  //match the location with the item
  //now hard-coded with the random geolocation and distance
  async matchlocation(item: ObjectId, location: ObjectId) {
    const item_geolocation = getGeolocation(item);
    const the_location = await this.getLocationById(location);
    const location_geolocation = the_location.geog_location;
    const distance = getDistance(item_geolocation.lat, item_geolocation.long, location_geolocation.lat, location_geolocation.long);
    if (distance < 10) {
      return true;
    }
    return false;
  }
}
