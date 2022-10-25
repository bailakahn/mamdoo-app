export default {
    APPS: {
        CLIENT: "client",
        DRIVER: "partner"
    },
    REGEX: {
        password:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d[\]{};:=<>_+^#$@!%*?&]{8,30}$/,
        licencePlate: /^\d{4}[A-Z]{1,2}$/
    }
};
