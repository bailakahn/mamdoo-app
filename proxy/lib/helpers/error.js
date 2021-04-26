module.exports = (type, message, code, status, notify) => {
  const error = new Error(message);
  error.status = status;
  error.type = type;
  error.code = code;
  error.applauz = true;

  if (notify) {
    if (notify.applauz) console.log("Notifying applauz users");
    if (notify.client) {
      console.log("Notfying", notify.recipients);
    }
  }

  throw error;
};
