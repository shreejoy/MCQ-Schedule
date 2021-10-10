import { ActionTypes } from "../constants/actionconstants";
let default_state = {
    auth: true,
    user: {u:1},
    contributors: null,
    timetable: null,
    topics: null,
};

let reducerFunction = (state = default_state, action) => {
    switch (action.type) {
        case ActionTypes.AUTH:
            return { ...state, auth: action.payload };
        case ActionTypes.AUTHENTICATED_USER:
            return { ...state, user: action.payload };
        case ActionTypes.CONTRIBUTORS:
            return { ...state, contributors: action.payload };
        case ActionTypes.TIMETABLE:
            return { ...state, timetable: action.payload };
        case ActionTypes.TOPICS:
            return { ...state, topics: action.payload };
        default:
            return state;
    }
};

export default reducerFunction;
