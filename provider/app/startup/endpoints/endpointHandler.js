module.exports = async (req, res, next, handler) => {
  try {
    const response = await handler({ req, res, next });
    // if request was `ok` send response to client
    res.status(200).send(response || { success: true });
  } catch (err) {
    next(err);
  }
};
