// contains your app definition (i.e., concept instantiations).
import ChannelConcept from "./concepts/channel";
import EventConcept from "./concepts/event";
import FriendConcept from "./concepts/friend";
import LocationConcept from "./concepts/location";
import MessageConcept from "./concepts/message";
import PostConcept from "./concepts/post";
import TagConcept from "./concepts/tag";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";
// import * as Error from "./concepts/errors";
// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Message = new MessageConcept();
export const Location = new LocationConcept();
export const Channel = new ChannelConcept();
export const Event = new EventConcept();
export const Tag = new TagConcept();
