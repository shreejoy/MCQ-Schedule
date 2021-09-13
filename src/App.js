import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./pages/home-page/Home";
import Post from "./pages/post-page/Post";
import Login from "./pages/login-page/Login";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/post" component={Post} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
