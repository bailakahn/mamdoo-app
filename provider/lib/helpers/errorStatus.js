module.exports = (status) => {
  var error;

  switch (status) {
    case 400:
      error = new Error("Bad Request Error");
      error.type = "BadRequestError";
      error.code = "errors.bad_request";
      break;
    case 401:
      error = new Error("Unauthorized Error");
      error.status = status;
      error.type = "UnauthorizedError";
      error.code = "errors.unauthorized";
      break;
    case 403:
      error = new Error("Forbidden Error");
      error.status = status;
      error.type = "ForbiddenError";
      error.code = "errors.forbidden";
      break;
    case 404:
      error = new Error("Not Found Error");
      error.status = status;
      error.type = "NotFoundError";
      error.code = "errors.not_found";
      break;
    default:
      error = new Error("Internal Server Error");
      error.status = 500;
      error.type = "InternalServerError";
      error.code = "errors.internal_server";
      break;
  }

  error.applauz = true;
  throw error;
};
