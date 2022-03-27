exports.newMessage = (sender, recepient, type, data) => {
  return {
    sender,
    recepient,
    type,
    data,
    timestamp: Date(),
  };
};