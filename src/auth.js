import { setUser } from "./redux/actions/actions";
import { useDispatch } from "react-redux";

function Auth() {
    const dispatch = useDispatch();

    fetch("data/timetable.json")
        .then((resp) => resp.json())
        .then((timetable) => dispatch(setUser(timetable)));
    return () => {};
}

export default Auth;
