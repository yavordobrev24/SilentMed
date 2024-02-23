import {
  BrowserRouter as Router,
  Route,Routes
} from "react-router-dom";
import Home from "../Home/Home";
import "./App.css";
import CreateQuestion from "../CreateQuestion/CreateQuestion";
import AnswerQuestion from "../AnswerQuestion/AnswerQuestion";
import AnswerSummary from "../AnswerSummary/AnswerSummary";
import CreateQuestions from "../CreateQuestions/CreateQuestions";

function App() {

  return (
    <Router>
      <Routes>
        <Route index element={<Home/>}></Route>
        <Route path="/create-question" element={<CreateQuestion/>}></Route>
       <Route path="/answer-question" element={<AnswerQuestion/>}></Route>
        <Route path="/answer-summary" element={<AnswerSummary/>}></Route>
        <Route path="/create-questions" element={<CreateQuestions/>}></Route>
      </Routes>


    </Router>
  )
}

export default App
