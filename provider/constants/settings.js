module.exports = {
  APPS: {
    CLIENT: "client",
    DRIVER: "partner",
  },
  REGEX: {
    password:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d[\]{};:=<>_+^#$@!%*?&]{8,30}$/,
    licencePlate: /^\d{4}[A-Z]{1,2}$/,
  },
  MAX_DISTANCE_DEFAULT: 5000,
  DRIVER_LAST_SEEN_DEFAULT: 24,
};
