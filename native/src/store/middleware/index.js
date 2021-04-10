// import verifyToken from "@api/verifyToken";
const applyMiddleware = (
    // destructure state
    {
        authData: {
            auth: { accessTokenExpiresAt, refreshToken }
        },
        api: { endpoints }
    },
    dispatch
) => (action) => {
    // if action has a callback then check token validity
    if (action.callback) {
        // verifyToken(dispatch, accessTokenExpiresAt, refreshToken, endpoints).then(
        //   () => {
        //     switch (action.type) {
        //       case types.SET_USER:
        //         action["callback"]()
        //           .then(({ success, user }) => {
        //             dispatch({
        //               type: types.SET_USER,
        //               user,
        //             });
        //           })
        //           .catch((err) => {
        //             console.log(err);
        //           });
        //     }
        //   }
        // );
    } else {
        dispatch(action);
    }
};

export default applyMiddleware;
