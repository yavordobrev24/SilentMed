import {
  BrowserRouter as Router,
  Route,Routes
} from "react-router-dom";
import Home from "../Home/Home";
/*import About from "../About/About";*/
import "./App.css";
import CreateQuestion from "../CreateQuestion/CreateQuestion";
import CreateSurvey from "../CreateSurvey/CreateSurvey";

function App() {

  return (
    <Router>
      <Routes>
        <Route index element={<Home/>}></Route>
        {/*<Route path="/about" element={<About/>}></Route>*/}
        <Route path="/create-question" element={<CreateQuestion/>}></Route>
        <Route path="/create-survey" element={<CreateSurvey/>}></Route>
        
      </Routes>


    </Router>
  )
}

export default App
