import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom"

import './App.css';

import LoginForm from "./Components/LoginForm";
import SignupForm from "./Components/SignupForm";
//import TheWebSocket from "./Components/WebSocket";
import CreateRemove from "./Components/CreateRemove";

//<Route path="/private" element={<TheWebSocket />} />

function App() {
  return (
    <BrowserRouter>


      <Routes>
        <Route exact path="/" element={<CreateRemove />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />

      </Routes>
    </BrowserRouter>

  )
}


export default App;
