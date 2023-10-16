import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Channel, Event, Friend, Location, Message, Post, Tag, User, WebSession } from "./app";
import { getGeolocation, transferaddresstoGeolocation } from "./concepts/location";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";
// import {BadValuesError, NotFoundError, UnauthenticatedError} from "./concepts/errors";

//contains the code for your API routes. Try to keep your route definitions as simple as possible.

class Routes {
  // a function to get the IP address of the User/ Post / Channel using geolocation api
  // TODO
  @Router.get("/location")
  async gettheitemLocation(item: ObjectId) {
    //now harded-coded
    return getGeolocation(item);
    // throw new Error("Not implemented yet!");
  }
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
    // match the user with the location
    // add the user to that location
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  /**
   * Location routes
   */
  // Location: create a location
  // whenever a item (post, channel, event) is created, it will be assigned to a location
  @Router.post("/location")
  async createLocation(name: string, centered_element: ObjectId, points: ObjectId[]) {
    const geographicallocaltion = getGeolocation(centered_element);
    // centerelement is either a Channel or Event
    let centerele = null;
    try {
      centerele = await Channel.getChannelById(centered_element);
    } catch (e) {
      try {
        centerele = await Event.getEventById(centered_element);
      } catch (e) {
        throw new Error("Centered element not found or illegal type!");
      }
    }
    return await Location.makeLoc(name, centerele, points, geographicallocaltion);
  }

  // Location: get the location by name
  @Router.get("/location/name")
  async getLocationbyName(name: string) {
    return await Location.getLocationByName(name);
  }
  // TODO: Not test
  @Router.get("/location")
  async getLocationbyId(_id: ObjectId) {
    return await Location.getLocationById(_id);
  }

  // location: refresh the user  location
  @Router.put("/location")
  async refreshLocation(session: WebSessionDoc) {
    // refresh the current log in user's location
    throw new Error("Not implemented yet!");
  }

  // location: find the nearby location item
  // need reconsideration in assign 5
  @Router.put("/location")
  async findNearbyLocation(session: WebSessionDoc) {
    // find the nearby location item
    const user = WebSession.getUser(session);
    const user_location = await Location.findlocation(user);
    const nearby = await Location.findlocationPoints(user_location[0]._id);
    return nearby;
  }

  /**
   * Event routes
   */
  // Event: create a event, add the initial user to the event
  @Router.post("/event")
  async createEvent(session: WebSessionDoc, name: string, eventinfo: string, eventMember: ObjectId[], address: string) {
    const new_event = await Event.create_event(name, eventinfo, eventMember);
    const user = WebSession.getUser(session);
    const geolocationoftheevent = transferaddresstoGeolocation(address);
    if (!new_event.event) {
      throw new Error("Event not found!");
    }
    await Event.join(new_event.event._id, user);
    //create a channel for the event
    const correspond_channel = await Channel.create_channel(name, eventMember, "events");
    //create a location for the event
    const correspond_location = await Location.makeLoc(name, new_event.event, eventMember, geolocationoftheevent);
    //create a private tag for the event
    const the_tag = await Tag.searchTag(name, "private_label");
    if (the_tag === null) {
      const the_tag = await Tag.addTag(name, "private_label");
      return correspond_channel.channel, the_tag.tag, correspond_location.location, new_event.event;
    } else {
      throw new Error("Tag already exists, give a new name to the event");
    }
  }

  // Event: get the event by name
  @Router.get("/event")
  async getEventsbyName(name: string) {
    return await Event.getEventByName(name);
  }

  // Event: remove the event with its name
  @Router.delete("/event")
  async removeEvent(name: string) {
    const the_event = await Event.getEventByName(name);
    if (!the_event) {
      throw new Error("Event not found!");
    }
    return await Event.remove_event(the_event._id);
  }

  // Event: invite a user to the event
  @Router.put("/event/request")
  async sendEventInvite(session: WebSessionDoc, eventname: string, to: string) {
    const user = WebSession.getUser(session);
    const the_event = await Event.getEventByName(eventname);
    const inviteuser = await User.getUserByUsername(to);
    //check if the user is in the event
    await Event.validate(the_event._id, user);
    if (!the_event) {
      throw new Error("Event not found!");
    }
    if (!inviteuser) {
      throw new Error("User not found!");
    }
    return await Event.sendEventInvitation(the_event._id, user, inviteuser._id);
  }
  @Router.get("/event/request")
  async getEventInvite(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Event.getEventInvitation(user);
  }

  @Router.put("/event/accept")
  async acceptEventInvite(session: WebSessionDoc, eventname: string, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    const the_event = await Event.getEventByName(eventname);
    await Event.acceptEventInvitation(the_event._id, fromId, user);
    // join the event
    return await Event.join(the_event._id, user);
  }

  @Router.put("/event/reject")
  async rejectEventInvite(session: WebSessionDoc, eventname: string, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    const the_event = await Event.getEventByName(eventname);
    return await Event.rejectEventInvitation(the_event._id, fromId, user);
  }

  // Event: join the event
  @Router.put("/event/join")
  async joinEvent(session: WebSessionDoc, eventname: string) {
    const user = WebSession.getUser(session);
    const the_event = await Event.getEventByName(eventname);
    if (!the_event) {
      throw new Error("Event not found!");
    }
    await Event.join(the_event._id, user);
    const event_tag = await Tag.searchTag(eventname, "private_label");
    if (event_tag === null) {
      throw new Error("Tag not found!");
    } else {
      await Tag.addItemtoTag(user, event_tag._id);
    }
    return the_event;
  }

  // Event: quit the event
  @Router.put("/event/quit")
  async quitEvent(session: WebSessionDoc, eventname: string) {
    const user = WebSession.getUser(session);
    const the_event = await Event.getEventByName(eventname);
    if (!the_event) {
      throw new Error("Event not found!");
    }
    await Event.quiet(the_event._id, user);
    const event_tag = await Tag.searchTag(eventname, "private_label");
    if (event_tag === null) {
      throw new Error("Tag not found!");
    } else {
      await Tag.removeItemFromTag(user, event_tag.label, "private_label");
    }
    return the_event;
  }

  /**
   * Channel routes
   */
  // Channel: create a channel
  // TODO: Under consideration if the user could create a channel
  @Router.post("/channel")
  async createChannel(session: WebSessionDoc, name: string, type: "events" | "places", members: ObjectId[], address: string) {
    // let the current log in user create a channel
    const creator = WebSession.getUser(session);
    const new_channel = await Channel.create_channel(name, members, type);
    if (!new_channel.channel) {
      throw new Error("Channel not found!");
    }
    await Channel.join(new_channel.channel._id, creator);
    // create a location for the channel
    const geolocationofthechannel = transferaddresstoGeolocation(address);
    const correspond_location = await Location.makeLoc(name, new_channel.channel, members, geolocationofthechannel);
    return correspond_location.location, new_channel;
  }

  // Channel: get the channel by name
  @Router.get("/channel")
  async getChannelbyName(name: string) {
    return await Channel.getChannelByName(name);
  }

  // Channel: remove the channel with its name
  @Router.delete("/channel")
  async removeChannel(name: string) {
    const the_channel = await Channel.getChannelByName(name);
    return await Channel.remove_channel(the_channel._id);
  }

  // channel: join the channel (for event)
  @Router.put("/channel/join/event")
  async event_joinChannel(session: WebSessionDoc, channelname: string) {
    const user = WebSession.getUser(session);
    const the_channel = await Channel.getChannelByName(channelname);
    if (!the_channel) {
      throw new Error("Channel not found!");
    }
    const event = await Event.getEventByName(channelname);
    const isUserInEvent = await Event.validate(event._id, user);
    if (isUserInEvent) {
      return await Channel.join(the_channel._id, user);
    } else {
      throw new Error("You are not in the event!");
    }
  }

  @Router.put("/channel/join/location")
  async location_joinChannel(session: WebSessionDoc, channelname: string) {
    const user = WebSession.getUser(session);
    const the_channel = await Channel.getChannelByName(channelname);
    if (!the_channel) {
      throw new Error("Channel not found!");
    }
    const location = await Location.getLocationByName(channelname);
    const isUserInLocation = await Location.matchlocation(user, location._id);
    if (isUserInLocation) {
      await Channel.join(the_channel._id, user);
      return { msg: "join successfully", channel: the_channel };
    } else {
      throw new Error("Only the user nearby the channel can join!");
    }
  }

  // channel: quit the channel
  @Router.put("/channel/quit")
  async event_quitChannel(session: WebSessionDoc, channelname: string) {
    // validate if the user is in the channel
    const user = WebSession.getUser(session);
    const the_channel = await Channel.getChannelByName(channelname);
    if (!the_channel) {
      throw new Error("Channel not found!");
    }
    if (await Channel.checkauthorized(the_channel._id, user)) {
      return await Channel.quiet(the_channel._id, user);
    } else {
      throw new Error("You are not in the channel!");
    }
  }

  @Router.get("/channel/invite")
  async getChannelInvite(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Channel.getInvitation(user);
  }

  // invite other user to the channel
  @Router.post("/channel/invite/:to")
  async sendChannelInvite(session: WebSessionDoc, channelname: string, to: string) {
    const sender = WebSession.getUser(session);
    const the_channel = await Channel.getChannelByName(channelname);
    const receiver = await User.getUserByUsername(to);
    //check if the receiver is authenticated to join the channel
    //if the channel is a event channel / check the receiver is in the event
    if (the_channel.type === "events") {
      if (await Event.validate(the_channel._id, receiver._id)) {
        return await Channel.sendInvitation(the_channel.name, sender, receiver._id);
      }
    }
    // TODO: if the channel is a location channel / check the receiver is in the location
  }

  @Router.delete("/channel/invite/:to")
  async removeChannelInvite(session: WebSessionDoc, channelname: string, to: string) {
    const sender = WebSession.getUser(session);
    const the_channel = await Channel.getChannelByName(channelname);
    const receiver = await User.getUserByUsername(to);
    return await Channel.removeInvitation(the_channel._id, sender, receiver._id);
  }

  @Router.put("/channel/accept/:from")
  async acceptChannelInvite(session: WebSessionDoc, channelname: string, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    const the_channel = await Channel.getChannelByName(channelname);
    return await Channel.acceptInvitation(the_channel._id, fromId, user);
  }

  @Router.put("/channel/reject/:from")
  async rejectChannelInvite(session: WebSessionDoc, channelname: string, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    const the_channel = await Channel.getChannelByName(channelname);
    return await Channel.rejectInvitation(the_channel._id, fromId, user);
  }
  /**
   * message routes
   */
  // message: send a message
  //TODO: TEST (after Channel is tested)
  @Router.post("/message")
  async sendMessage(session: WebSessionDoc, chatchannel: string, contents: string) {
    const sender = WebSession.getUser(session);
    const the_channel = await Channel.getChannelByName(chatchannel);
    const receivers = the_channel.members;
    const the_message = [];
    // check if the sender is in the channel
    if (await Channel.checkauthorized(the_channel._id, sender)) {
      for (const users of receivers) {
        the_message.push(await Message.send(sender, users, contents));
      }
    } else {
      throw new Error("You are not authorized to send a message!");
    }
    // assign each message with a tag of it's channel name
    const the_tag = await Tag.searchTag(chatchannel, "private_label");
    if (the_tag === null) {
      // should be a private tag
      throw new Error("Should be a private event for this channel");
    } else {
      for (const message of the_message) {
        if (message.message && the_tag._id) {
          await Tag.addItemtoTag(message.message._id, the_tag._id);
        }
      }
    }
    return the_message;
  }

  // message: get the message
  @Router.get("/message/content")
  async searchMessagbyContent(content: string) {
    // get the message from the chat / channel
    return await Message.getallMessageBycontent(content);
  }
  @Router.get("/message/sender")
  async getMessagebySender(sender: string) {
    // get the message from the chat / channel
    const senderId = (await User.getUserByUsername(sender))._id;
    return await Message.getMessagesBySender(senderId);
  }

  @Router.get("/message/channel")
  async getMessagebyChannel(chatchannel: string) {
    // get the message from the chat / channel
    const the_channel = await Channel.getChannelByName(chatchannel);
    // get all the sender in that channel and the message they sent
    const members = the_channel.members;
    const messages = [];
    for (const user of members) {
      const message = await Message.getMessagesBySender(user);
      messages.push(message);
    }
    return messages;
  }

  // message: delete the message
  @Router.delete("/message")
  async deleteMessage(ms: ObjectId, session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    await Message.delete(ms, user);
  }

  /**Tags Routes */
  @Router.put("/tag")
  async createtag(session: WebSessionDoc, label: string, privacy: "public_label" | "private_label") {
    const the_tag = await Tag.searchTag(label, privacy);
    if (the_tag === null) {
      const new_tag = await Tag.addTag(label, privacy);
      return new_tag;
    } else {
      throw new Error("Tag already exists!");
    }
  }

  @Router.put("/tag/item")
  async addItemtoTag(session: WebSessionDoc, item: ObjectId, label: string, privacy: "public_label" | "private_label") {
    const the_tag = await Tag.searchTag(label, privacy);
    if (the_tag === null) {
      throw new Error("Tag not found!!");
    }
    if (privacy === "public_label") {
      await Tag.addItemtoTag(item, the_tag._id);
    } else {
      const user = WebSession.getUser(session);
      if (await Tag.verifyifIteminTag(user, the_tag._id)) {
        await Tag.addItemtoTag(item, the_tag._id);
      } else {
        throw new Error("You are not authorized to add item to this tag!");
      }
    }
    return { ms: "Item added successfully", tag: the_tag };
  }

  @Router.delete("/tag")
  async removeTag(session: WebSessionDoc, _id: ObjectId) {
    return await Tag.removeTag(_id);
  }

  @Router.get("/tag")
  async getTag(session: WebSessionDoc, label: string, restrict: "strict" | "Loose", privacy: "public_label" | "private_label") {
    if (restrict === "strict") {
      return await Tag.searchTag(label, privacy);
    }
    return await Tag.searchTag_loose(label, privacy);
  }

  @Router.get("/tag/items")
  async getItems(session: WebSessionDoc, label: string) {
    const the_tag_private = await Tag.searchTag(label, "private_label");
    const the_tag_public = await Tag.searchTag(label, "public_label");
    const the_user = WebSession.getUser(session);
    const returnItem = [];
    if (the_tag_public !== null) {
      returnItem.push(await Tag.getItems(the_tag_public._id));
    }
    if (the_tag_private === null && the_tag_public === null) {
      throw new Error("Tag not found!");
    }
    if (the_tag_public === null && the_tag_private !== null) {
      if (await Tag.verifyifIteminTag(the_user, the_tag_private._id)) {
        returnItem.push(await Tag.getItems(the_tag_private._id));
      } else {
        throw new Error("You are not authorized to check the private tag!");
      }
    }
    return returnItem;
  }
}

// @Router.patch("/location")
// async updatelocation() {
// automatically update the location of the user per half hour
// }

export default getExpressRouter(new Routes());
