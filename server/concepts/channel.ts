import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

/**
 * This is a concept of chat-channel
 * concept Channel [User]
	purpose 
		authenticate the user to temporarily join the channel 
	principle
		when the users u have the same location with the channel
		they are allowed to join the channel
	state
		channels: set String -> Channel
		member: set User id -> the users in the channel
        type: String -> the type of the channel (events, places)
	actions
        create_channel (name: String, type: String, members: set User id)
        remove_channel (channel: Channel)
        getChannelById (_id: ObjectId)
        getChannelByName (name: String)
        join (channel: Channel, user: User)
        quiet (channel: Channel, user: User)
 */

// Data model for channels
export interface ChannelDoc extends BaseDoc {
  name: string;
  members: ObjectId[]; // list of user ids
  type: "events" | "places";
  address: string;
  expired_time: number;
}
export interface InvitationDoc extends BaseDoc {
  sender: ObjectId;
  receiver: ObjectId;
  channel: ObjectId;
  status: "pending" | "accepted" | "rejected";
}

export default class ChannelConcept {
  public readonly channels = new DocCollection<ChannelDoc>("channels");
  public readonly invitations = new DocCollection<InvitationDoc>("invitations");
  //create a channel
  async create_channel(name: string, members: ObjectId[] = [], type: "events" | "places", address: string, expired_time: number) {
    await this.checkchannelexist(name);
    const _id = await this.channels.createOne({ name, members, type, address, expired_time });
    return { msg: "Channel created successfully!", channel: await this.channels.readOne({ _id }) };
  }

  async remove_channel(_id: ObjectId) {
    const the_channel = await this.getChannelById(_id);
    await this.channels.deleteOne({ _id });
    return { msg: "Channel removed successfully!", channel: the_channel };
  }

  async getChannelById(_id: ObjectId) {
    const the_channel = await this.channels.readOne({ _id });
    if (the_channel === null) {
      throw new NotFoundError(`Channel not found!`);
    }
    return the_channel;
  }

  async getChannelByName_soft(name: string) {
    // get channel if the channel name include the name
    const the_channel = await this.channels.readMany({ name: { $regex: name, $options: "i" } });
    if (the_channel === null) {
      throw new NotFoundError(`Channel not found!`);
    }
    return the_channel;
  }

  async getChannelByName(name: string) {
    // get channel if the channel name include the name
    const the_channel = await this.channels.readOne({ name });
    if (the_channel === null) {
      throw new NotFoundError(`Channel not found!`);
    }
    return the_channel;
  }

  async getallchannels() {
    const channels = await this.channels.readMany({});
    return channels;
  }

  async getchannelbymember(user: ObjectId) {
    //return all the channels that the user is included int the channel member (objectid arr)
    const channels = await this.channels.readMany({ members: { $in: [user] } });
    return channels;
  }

  async getchannelbycreator(user: ObjectId) {
    const allincludedchannel = await this.getchannelbymember(user);
    const channels = allincludedchannel.filter((channel) => channel.members[0].toString() === user.toString());
    return channels;
  }
  async checkchannelexist(name: string) {
    const the_channel = await this.channels.readOne({ name });
    if (the_channel !== null) {
      throw new NotFoundError(`Channel name has already existed!`);
    }
  }

  // add user to channel
  async join(channel: ObjectId, user: ObjectId) {
    const the_channel = await this.getChannelById(channel);
    if (await this.checkauthorized(the_channel._id, user)) {
      throw new NotFoundError(`You are already in the channel!`);
    }
    the_channel.members.push(user);
    await this.channels.updateOne({ _id: channel }, the_channel);
    return { msg: "User joined successfully!", channel: await this.channels.readOne({ _id: channel }) };
  }
  // remove user from channel
  async quiet(channel: ObjectId, user: ObjectId) {
    const the_channel = await this.getChannelById(channel);
    the_channel.members = the_channel.members.filter((member) => member.toString() !== user.toString());
    await this.channels.updateOne({ _id: channel }, the_channel);
    return { msg: "User quited successfully!", channel: await this.channels.readOne({ _id: channel }) };
  }

  async checkauthorized(channel: ObjectId, user: ObjectId) {
    const the_channel = await this.getChannelById(channel);
    const members = the_channel.members;
    const userIdString = user.toString();
    let _isUserInChannel = false;
    for (let i = 0; i < members.length; i++) {
      const member = members[i].toString();
      if (member === userIdString) {
        _isUserInChannel = true;
        break; // User is in the event; no need to continue the loop
      }
    }
    return _isUserInChannel;
  }

  async sendInvitation(channel: string, sender: ObjectId, receiver: ObjectId) {
    const the_channel = await this.getChannelByName(channel);
    if (the_channel === null) {
      throw new NotFoundError(`Channel not found!`);
    }
    if (!(await this.checkauthorized(the_channel._id, sender))) {
      throw new NotFoundError(`You are not in the channel!`);
    }
    if (the_channel.members.includes(receiver)) {
      throw new NotFoundError(`User already in the channel!`);
    }
    await this.invitations.createOne({ sender, receiver, channel: the_channel._id, status: "pending" });
    return { msg: "Invitation sent successfully!" };
  }

  async getInvitation(user: ObjectId) {
    return await this.invitations.readMany({
      $or: [{ from: user }, { to: user }],
    });
  }

  async acceptInvitation(channel: ObjectId, sender: ObjectId, receiver: ObjectId) {
    await this.removePendingInvitation(channel, sender, receiver);
    void this.invitations.createOne({ sender: sender, receiver: receiver, channel, status: "accepted" });
    await this.join(channel, receiver);
    return { msg: "Invitation accepted!" };
  }

  async rejectInvitation(channel: ObjectId, sender: ObjectId, receiver: ObjectId) {
    await this.removePendingInvitation(channel, sender, receiver);
    void this.invitations.createOne({ sender: sender, receiver: receiver, channel: channel, status: "rejected" });
    return { msg: "Invitation rejected!" };
  }

  async removeInvitation(channel: ObjectId, sender: ObjectId, receiver: ObjectId) {
    await this.removePendingInvitation(channel, sender, receiver);
    return { msg: "Invitation removed!" };
  }

  private async removePendingInvitation(channel: ObjectId, sender: ObjectId, receiver: ObjectId) {
    const the_invitation = await this.invitations.popOne({ sender, receiver, channel, status: "pending" });
    if (the_invitation === null) {
      throw new NotFoundError(`Invitation not found!`);
    }
    return the_invitation;
  }
}
