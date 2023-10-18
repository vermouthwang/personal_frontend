import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

/**
    concept Event [User]
	purpose
		sign user to a local event
	principle
		if a user is near a event location,
		a user is able to sign up and join a event
	state
		event: string -> one Location
		eventinfo : string -> set Item
		eventMember: set User
	actions
        create_event (name: string, eventinfo: string, eventMember: set User)
        remove_event (event: Event)
        getEventById (_id: ObjectId)
        getEventByName (name: string)
        join (event: Event, user: User)
        quiet (event: Event, user: User)
        validate (event: Event, user: User)
        searchjoinevent (user: User)
 */

// Data model for Event
export interface EventDoc extends BaseDoc {
  name: string; // name of the event
  eventinfo: string; // info of the event
  address: string; // address of the event
  eventMember: ObjectId[]; // list of event members
}
export interface EventInvitationDoc extends BaseDoc {
  sender: ObjectId;
  receiver: ObjectId;
  event: ObjectId;
  status: "pending" | "accepted" | "rejected";
}

export default class EventConcept {
  public readonly events = new DocCollection<EventDoc>("events");
  public readonly eventinvitations = new DocCollection<EventInvitationDoc>("eventinvitations");
  //create a event
  async create_event(name: string, eventinfo: string, address: string, eventMember: ObjectId[] = []) {
    await this.check_event(name);
    const _id = await this.events.createOne({ name, eventinfo, address, eventMember });
    return { msg: "Event created successfully!", event: await this.events.readOne({ _id }) };
  }

  //check if the event name has already existed
  async check_event(name: string) {
    const the_event = await this.events.readOne({ name });
    if (the_event !== null) {
      throw new BadValuesError(`Event name ${name} has already existed!`);
    }
  }

  //remove a event
  async remove_event(_id: ObjectId) {
    const the_event = await this.getEventById(_id);
    await this.events.deleteOne({ _id });
    return { msg: "Event removed successfully!", event: the_event };
  }

  async getEventById(_id: ObjectId) {
    const the_event = await this.events.readOne({ _id });
    if (the_event === null) {
      throw new NotFoundError(`Event not found!`);
    }
    return the_event;
  }

  async getEventByName(name: string) {
    const the_event = await this.events.readOne({ name });
    if (the_event === null) {
      //display the event name in the error message
      throw new NotFoundError(`Event ${name} not found!`);
    }
    return the_event;
  }

  async join(event: ObjectId, user: ObjectId) {
    const the_event = await this.getEventById(event);
    //validate if the user is already in the event
    if (await this.validate(event, user)) {
      throw new NotFoundError(`You are already in the event!`);
    }
    the_event.eventMember.push(user);
    await this.events.updateOne({ _id: event }, the_event);
    return { msg: "User joined successfully!" };
  }

  async quiet(event: ObjectId, user: ObjectId) {
    const the_event = await this.getEventById(event);
    await this.validate(event, user);
    the_event.eventMember = the_event.eventMember.filter((member) => member !== user);
    await this.events.updateOne({ _id: event }, the_event);
    return { msg: "User quited successfully!" };
  }

  async validate(event: ObjectId, user: ObjectId) {
    const the_event = await this.getEventById(event);
    const event_number = the_event.eventMember;
    // check if the user is in the event
    const userIdString = user.toString();
    let _isUserInEvent = false;
    for (let i = 0; i < event_number.length; i++) {
      const member = event_number[i].toString();
      if (member === userIdString) {
        _isUserInEvent = true;
        break; // User is in the event; no need to continue the loop
      }
    }
    return _isUserInEvent;
  }

  async searchjoinevent(user: ObjectId) {
    const events = await this.events.readMany({ _eventMember: { $in: user } });
    return events;
  }

  async sendEventInvitation(event: ObjectId, sender: ObjectId, receiver: ObjectId) {
    const the_event = await this.getEventById(event);
    if (the_event === null) {
      throw new NotFoundError(`Event not found!`);
    }
    if (!(await this.validate(event, sender))) {
      throw new NotFoundError(`You are not in the event!!`);
    }
    if (await this.validate(event, receiver)) {
      throw new NotFoundError(`User already in the event!`);
    }
    const _id = await this.eventinvitations.createOne({ sender, receiver, event, status: "pending" });
    return { msg: "Event Invitation sent successfully!", eventinvitation: await this.eventinvitations.readOne({ _id }) };
  }

  async getEventInvitation(user: ObjectId) {
    return await this.eventinvitations.readMany({
      $or: [{ sender: user }, { receiver: user }],
    });
  }

  async acceptEventInvitation(event: ObjectId, sender: ObjectId, receiver: ObjectId) {
    await this.removePendingEventInvitation(event, sender, receiver);
    await this.join(event, receiver);
    void this.eventinvitations.createOne({ event, sender, receiver, status: "accepted" });
    return { msg: "Event Invitation accepted!" };
  }

  async rejectEventInvitation(event: ObjectId, sender: ObjectId, receiver: ObjectId) {
    await this.removePendingEventInvitation(event, sender, receiver);
    void this.eventinvitations.createOne({ event, sender, receiver, status: "rejected" });
    return { msg: "Event Invitation rejected!" };
  }

  async removeEventInvitation(event: ObjectId, sender: ObjectId, receiver: ObjectId) {
    await this.eventinvitations.deleteOne({ event, sender, receiver });
    return { msg: "Event Invitation removed successfully!" };
  }

  async removePendingEventInvitation(event: ObjectId, sender: ObjectId, receiver: ObjectId) {
    const the_eventinvitation = await this.eventinvitations.popOne({ sender, receiver, event, status: "pending" });
    if (the_eventinvitation === null) {
      throw new NotFoundError(`Event Invitation not found!`);
    }
    return the_eventinvitation;
  }
}
