import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/home-page/Home";
import Post from "./pages/post-page/Post";
import Question from "./pages/question-page/Question";
import Questions from "./pages/questions-page/Questions";
import {
    setContributors,
    setTimetable,
    setTopics,
} from "./redux/actions/actions";

function App() {
    const dispatch = useDispatch();
    useEffect(() => {
        fetch("data/timetable.json")
            .then((resp) => resp.json())
            .then((timetable) => dispatch(setTimetable(timetable)));
        fetch("data/contributors.json")
            .then((resp) => resp.json())
            .then((contributors) => dispatch(setContributors(contributors)));
        fetch("data/topics.json")
            .then((resp) => resp.json())
            .then((topics) => dispatch(setTopics(topics)));
        return () => {};
        // eslint-disable-next-line
    }, []);
    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/post" component={Post} />
                    <Route exact path="/questions" component={Questions} />
                    <Route exact path="/question/:id" component={Question} />
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App;
