import { ACTIONS } from "./constants";

export function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_DIRECTION:
      return {
        ...state,
        ...action.payload,
      };

    default:
      throw Error(
        `Unhandled action type: ${action.type} | AppProvider > appReducer`
      );
  }
}
