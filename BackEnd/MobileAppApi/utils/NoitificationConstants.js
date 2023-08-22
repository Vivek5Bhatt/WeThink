const NOTIFICATION_TYPE = {
  COMMENT_SILENT_PUSH: 1,
  REPORT_COMMENT_ACCEPT: 2,
  REPORT_COMMENT_REJECT: 3,
  FOLLOW_REQUEST: 4,
  FRIEND: 5,
  FOLLOWING: 6,
  LIKE_POST: 7,
  MENTIONED_USERS: 8,
  COMMENT_POST: 9,
  VERIFICATION_REQUEST_ACCEPTED: 10,
  VERIFICATION_REQUEST_REJECTED: 11,
  VOTE: 12,
  POLL_END: 13,
  POST_CREATED: 15,
};

const NOTIFICATION_MESSAGE = {
  COMMENT_SILENT_PUSH: `Comment Silent Push`,
  FOLLOW_REQUEST: `{user_name} has shared a friend request.`,
  FOLLOWING: `{user_name} started following you.`,
  FRIEND: `{user_name} is your friend now.`,
  LIKE_POST: `{user_name} has liked your post.`,
  MENTIONED_USERS: `{user_name} has mentioned you in a comment.`,
  COMMENT_POST: `{user_name} has commented on your post.`,
  GROUP_LIKES: `{user_name} and {count} others liked your post.`,
  GROUP_COMMENTS: `{user_name} and {count} others commented on your post.`,
  GROUP_MENTIONED: `{user_name} has mentioned you and {count} others in a comment.`,
  GROUP_REPLY: `{user_name} and {count} others replied on your comment.`,
  COMMENT_REPLY: `{user_name} has replied on your comment.`,
  POST_CREATED: `{user_name} has posted a question.`,
  VOTE: `{user_name} has voted on your post.`,
  POLL_END: `{user_name}'s poll has ended! View results now!`,
};

module.exports = {
  NOTIFICATION_TYPE,
  NOTIFICATION_MESSAGE,
};