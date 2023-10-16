import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface MessageDoc extends BaseDoc {
  from: ObjectId;
  to: ObjectId;
  content: string;
}

/**
 * concept Message [User, Item]
	purpose exchange of message
	principle
		after a user sends a message to other users,
		they can receive that message
	state
		from, to : Msg -> set User
		body: Msg -> one Item
	actions
		send (from, to: User, body: Item, out m: Msg)
		recv (u: User, m: Msg)
        delete (m: Msg)
        deleteAll (u: User)
        displayContent (m: Msg)
 */

export default class MessageConcept {
  public readonly messages = new DocCollection<MessageDoc>("messages");

  async send(from: ObjectId, to: ObjectId, content: string) {
    const _id = await this.messages.createOne({ from, to, content });
    return { msg: "Message sent successfully!", message: await this.messages.readOne({ _id }) };
  }

  async recv(user: ObjectId) {
    const messages = await this.messages.readMany({ to: user });
    return messages[-1];
  }

  async getMessageById(id: ObjectId) {
    const message = this.messages.readOne({ _id: id });
    return message;
  }

  async getMessagesBySender(user: ObjectId) {
    const messages = await this.messages.readMany({ from: user });
    return messages;
  }

  async getallMessageBycontent(contents: string) {
    //get all message that includes the content
    const messages = await this.messages.readMany({ content: { $regex: contents } });
    return messages;
  }

  async displayContent(message: ObjectId) {
    const the_message = await this.messages.readOne({ _id: message });
    if (the_message === null) {
      throw new NotFoundError(`Message not found!`);
    }
    return the_message.content;
  }

  async delete(message: ObjectId, user: ObjectId) {
    const the_message = await this.messages.readOne({ _id: message });
    if (the_message === null) {
      throw new NotFoundError(`Message has alreday deleted!`);
    }
    if (await this.authorizedmessage(the_message.from, user)) {
      await this.messages.deleteOne({ _id: message });
    } else {
      throw new NotFoundError(`You are not authorized to delete this message!`);
    }
    return { msg: "Message deleted successfully!" };
  }

  async deleteAll(user: ObjectId) {
    await this.messages.deleteMany({ to: user });
    return { msg: "All messages deleted successfully!" };
  }

  async authorizedmessage(message: ObjectId, user: ObjectId) {
    const the_message = await this.messages.readOne({ _id: message });
    if (the_message === null) {
      throw new NotFoundError(`Message not found!`);
    }
    return the_message.from === user;
  }
}
