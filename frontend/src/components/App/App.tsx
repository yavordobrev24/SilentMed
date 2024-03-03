import "./App.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "../Home/Home";
import CreateQuestion from "../CreateQuestion/CreateQuestion";
import AnswerQuestion from "../AnswerQuestion/AnswerQuestion";
import Summary from "../Summary/Summary";

function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<Home />}></Route>
        <Route path="/create-question" element={<CreateQuestion />}></Route>
        <Route path="/answer-question" element={<AnswerQuestion />}></Route>
        <Route path="/summary" element={<Summary />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
