import React, { useEffect } from "react";
import { usePlantsFetcher, useUsersFetcher } from "./utilities/fetch";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Homepage } from "./components/pages/Homepage";
import { Browse } from "./components/pages/Browse";
import { Login } from "./components/pages/Login";
import { SignUp } from "./components/pages/SignUp";
import { Settings } from "./components/pages/Settings";
import { PlantProfile } from "./components/pages/PlantProfile";
import { UserProfile } from "./components/pages/UserProfile";
import { DetailedPlantList } from "./components/lists/DetailedPlantList";
import { Footer } from "./components/Footer";

import styled from "styled-components";
import GlobalStyles from "./GlobalStyles";

export const App = () => {
  // makes window scroll to top between renders
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  usePlantsFetcher();
  useUsersFetcher();

  return (
    <BrowserRouter>
      <GlobalStyles />
      <Navbar />
      <Main>
        <Switch>
          <Route exact path="/">
            <Homepage />
          </Route>
          <Route exact path="/browse">
            <Browse />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/signup">
            <SignUp />
          </Route>
          <Route exact path="/settings">
            <Settings />
          </Route>
          <Route path="/user-profile/:username">
            <UserProfile />
          </Route>
          <Route path="/user-collection/:username">
            <DetailedPlantList title="collection" />
          </Route>
          <Route path="/user-favorites/:username">
            <DetailedPlantList title="favorites" />
          </Route>
          <Route path="/user-wishlist/:username">
            <DetailedPlantList title="wishlist" />
          </Route>
          <Route path="/plant-profile/:id">
            <PlantProfile />
          </Route>
        </Switch>
        <Footer />
      </Main>
    </BrowserRouter>
  );
};

// adjusts width of main content to account for responsive navbar
const Main = styled.main`
  width: calc(100vw - 240px);
  @media (max-width: 999px) {
    width: calc(100vw - 92px);
  }
`;
