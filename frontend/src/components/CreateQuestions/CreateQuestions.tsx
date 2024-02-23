import { useState, ChangeEvent } from 'react';
import styles from "./CreateQuestions.module.css";
import commonStyles from "../Common.module.css";
import { useNavigate } from 'react-router-dom';

export default function CreateQuestions(): JSX.Element {
    const [numQuestions, setNumQuestions] = useState<number>(1); 
    const navigate = useNavigate();
    const submitHandler = ()=>{
      sessionStorage.setItem("numQuestions",JSON.stringify(numQuestions));
      sessionStorage.setItem("questions",JSON.stringify([]))
      navigate("/create-question");
    }
    const handleNumQuestionsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setNumQuestions(Math.min(Math.max(value, 1), 100));
      };
    const handleDecrease = () => {
        setNumQuestions((prevNumQuestions) => Math.max(prevNumQuestions - 1, 0));
      };
    
      const handleIncrease = () => {
        setNumQuestions((prevNumQuestions) => Math.min(prevNumQuestions + 1, 100));
      };
return(<div className={styles["number-question"]}>
  <div>
<h2>How many questions would you like to create?</h2>
<div className={styles.seperator}>
        </div>  
        </div>
<div>
  <button onClick={handleDecrease} disabled={numQuestions === 1}>-</button>
  <input
    type="number"
    min="1"  
    max="100"
    value={numQuestions}
    onChange={handleNumQuestionsChange}
  />
  <button onClick={handleIncrease}>+</button>
</div>
<button className={commonStyles.btn} onClick={()=>submitHandler()}><span>Create Questions</span></button>
</div>)

}