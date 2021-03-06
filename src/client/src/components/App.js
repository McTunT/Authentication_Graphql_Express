import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import withSession from "./Session/withSession";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Signup from "./Signup";
import Logout from "./Logout";
import MainLayout from "./Layout/MainLayout";
import { AppWarp } from "../style/globalStyle";

const Root = ({ refetch, session }) => (
  <Router>
    <Switch>
      <AppWarp>
        <Route
          path="/"
          exact
          render={props => (
            <MainLayout>
              <Login {...props} refetch={refetch} />
            </MainLayout>
          )}
        />
        <Route
          path="/login"
          render={props => (
            <MainLayout>
              <Login {...props} refetch={refetch} />
            </MainLayout>
          )}
        />
        <Route
          path="/Signup"
          render={props => (
            <MainLayout>
              <Signup {...props} refetch={refetch} />
            </MainLayout>
          )}
        />
        <Route
          path="/dashboard"
          render={props => (
            <MainLayout>
              <Dashboard {...props} session={session} refetch={refetch} />
            </MainLayout>
          )}
        />
        <Route
          path="/logout"
          render={props => (
            <MainLayout>
              <Logout {...props} refetch={refetch} />
            </MainLayout>
          )}
        />
      </AppWarp>
    </Switch>
  </Router>
);

const App = withSession(Root);

export default App;
