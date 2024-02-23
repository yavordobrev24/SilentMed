import { useEffect, useState } from "react";
import styles from './AnswerSummary.module.css';
import commonStyles from '../Common.module.css';
import {Link} from "react-router-dom";

interface AnsweredQuestion {
  question: string;
  answer: string;
}

const AnswerSummary = () => {
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);

  useEffect(() => {
    const answeredQuestionsString = sessionStorage.getItem("answeredQuestions");

    if (answeredQuestionsString) {
      const answeredQuestionsData: AnsweredQuestion[] = JSON.parse(answeredQuestionsString);
      setAnsweredQuestions(answeredQuestionsData);
    }
  }, []);

  return (
    <div className={styles.container}>
      {answeredQuestions.length === 1 ? (
        <div className={styles.screen}>
       <p className={styles["question-row"]}>{answeredQuestions[0].question}</p>
       <br />
       <p className={styles["answer-row"]}>{answeredQuestions[0].answer}</p>
     </div>
      ) : (
        <ul>
          {answeredQuestions.map((answeredQuestion, index) => (
            <li key={index}>
       <div className={styles.screen}>
       <p className={styles["question-row"]}>{answeredQuestion.question}</p>
       <br />
       <p className={styles["answer-row"]}>{answeredQuestion.answer}</p>
     </div>
            </li>
          ))}
        </ul>
      )}
      <Link to="/" className={commonStyles.btn}>Back to Home</Link>
    </div>
    
  );

};

export default AnswerSummary;
