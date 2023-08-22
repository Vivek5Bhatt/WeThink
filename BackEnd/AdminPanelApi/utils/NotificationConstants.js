const NOTIFICATION_TYPE = {
    COMMENT_SILENT_PUSH: 1,
    REPORT_COMMENT_ACCEPT: 2,
    REPORT_COMMENT_REJECT: 3,
    FOLLOW_REQUEST: 4,
    FRIEND: 5,
    FOLLOWING: 6,
    VERIFICATION_REQUEST_ACCEPTED: 10,
    VERIFICATION_REQUEST_REJECTED: 11,
    REPORTED_USER_ACCEPTED: 16,
    REPORTED_USER_REJECTED: 17,
    REPORTED_USER_SINGLE_REPLY: 18,
    REPORTED_USER_GROUP_REPLY: 19,
    REPORTED_POST_SINGLE_REPLY: 20,
    REPORTED_POST_GROUP_REPLY: 21
}
const NOTIFICATION_MESSAGE = {
    COMMENT_SILENT_PUSH: `Comment Silent Push`,
    REPORT_COMMENT_ACCEPT: `"{comment}" comment was removed from WeThink.Thank you for letting us know about the {user_name} comment. It looks like it was already removed. Please let us know if you see anything else that concerns you.Reports like yours are an important part of making WeThink a safe and welcoming place for everyone. `,
    REPORT_COMMENT_REJECT: `We've reviewed "{comment}" comment and found that it doesn't voilate our Community Guidelines.
    Thank you for requesting a review. We reviewed "{comment}" comment and confirm that it doesn't voilate any of our community guidelines, including "{commentReason}".Reports like yours are an important part of making WeThink a safe and welcoming place for everyone.`,
    VERIFICATION_REQUEST_ACCEPTED: `Hello {username}, your account verification request is accepted!`,
    VERIFICATION_REQUEST_REJECTED: `Hello {username}, your account verification is rejected.`,
    REPORTED_USER_ACCEPTED: `Thank you for letting us know about the {user_name} account. It looks like it was already removed. Please let us know if you see anything else that concerns you.Reports like yours are an important part of making WeThink a safe and welcoming place for everyone. `,
    REPORTED_USER_REJECTED: `We've reviewed "{user_name}" account and found that it doesn't voilate our Community Guidelines.
    Thank you for requesting a review.Reports like yours are an important part of making WeThink a safe and welcoming place for everyone.`,
    REPORTED_USER_SINGLE_REPLY: ` Admin has replied on your reported user activity here's the message {reply_message}`,
    REPORTED_USER_GROUP_REPLY: ` Admin has replied on all of your reported user activity here's the message {reply_message}`,
    REPORTED_POST_SINGLE_REPLY: ` Admin has replied on your reported post activity here's the message {reply_message}`,
    REPORTED_POST_GROUP_REPLY: ` Admin has replied on all of your reported post activity here's the message {reply_message}`
}
const NOTIFICATION_TITLE = {
    ACCOUNT_VERIFICATION_REQUEST: 'Account Verification Status'
}

module.exports = {
    NOTIFICATION_TYPE,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_TITLE
}