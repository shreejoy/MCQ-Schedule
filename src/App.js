import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/home-page/Home";
import Post from "./pages/post-page/Post";
import Question from "./pages/question-page/Question";
import Questions from "./pages/questions-page/Questions";

function App() {
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
