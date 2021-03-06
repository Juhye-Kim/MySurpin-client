import {
  SIGN_IN,
  SIGN_OUT,
  USER_EDIT,
  WITHDRAWAL,
  GET_GOOGLE_TOKEN,
} from "../actions/index";
import { initialState } from "./initialState";

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SIGN_IN:
      return Object.assign({}, state, {
        user: action.payload,
      });

    case SIGN_OUT:
      return Object.assign({}, state, {
        user: {
          token: null,
          email: null,
          nickname: "guest",
        },
      });

    case USER_EDIT:
      return Object.assign({}, state, {
        user: {
          token: action.payload.token,
          email: action.payload.email,
          nickname: action.payload.nickname,
        },
      });

    case WITHDRAWAL:
      return Object.assign({}, state, {
        user: {
          token: null,
          email: null,
          nickname: "guest",
        },
      });

    case GET_GOOGLE_TOKEN:
      return Object.assign({}, state, {
        googleToken: action.payload.data,
      });

    default:
      return state;
  }
};

export default userReducer;
