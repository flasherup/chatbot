module.exports = (event) => {
    const userId = event.sender.id;
    const postback = event.postback;
    console.log("postback", postback, "userId", userId)
}