import { useEffect, useState, useRef } from "react";
import styles from "./AnswerQuestion.module.css";
import { useNavigate } from "react-router-dom";
import file from "../../../../cortex/nodejs/stream_data_log.txt";

interface Question {
  question: string;
  answers: string[];
}

interface AnsweredQuestion {
  question: string;
  answer: string;
}

const Q1_THRESHOLD = 0;

const AnswerQuestions = () => {
  const [questionObj, setQuestionObj] = useState<Question | null>(null);
  const navigate = useNavigate();

  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const questionString = sessionStorage.getItem("question");
    if (questionString) {
      const questionParsed: Question = JSON.parse(questionString);
      setQuestionObj(questionParsed);
    }
    const fetchData = async () => {
      try {
        const response = await fetch(file);
        const data = await response.text();
        const lines = data.split("\n");
        const lastestData = lines[lines.length - 2];
        const parsedData = JSON.parse(lastestData);
        const Q1 = parsedData.mot[3];

        if (Q1 < Q1_THRESHOLD) {
          console.log("Right");
          rightButtonRef.current?.classList.add(styles.hovered);
          leftButtonRef.current?.classList.remove(styles.hovered);

          setTimeout(() => {
            rightButtonRef.current?.click();
          }, 4000);
        } else {
          console.log("Left");
          leftButtonRef.current?.classList.add(styles.hovered);
          rightButtonRef.current?.classList.remove(styles.hovered);
          setTimeout(() => {
            leftButtonRef.current?.click();
          }, 4000);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const fetchDataInterval = setInterval(fetchData, 1000);

    return () => {
      clearInterval(fetchDataInterval);
    };
  }, [setQuestionObj, navigate]);

  const handleAnswerClick = (e: any) => {
    if (questionObj) {
      const answeredQuestion: AnsweredQuestion = {
        question: questionObj.question,
        answer: e.target.textContent,
      };

      const answeredQuestionsString: string | null =
        sessionStorage.getItem("answeredQuestions");
      if (answeredQuestionsString) {
        const answeredQuestionsParsed = JSON.parse(answeredQuestionsString);

        answeredQuestionsParsed.push(answeredQuestion);
        sessionStorage.setItem(
          "answeredQuestions",
          JSON.stringify(answeredQuestionsParsed)
        );
        sessionStorage.removeItem("question");
      }
      setQuestionObj(null);
      navigate("/create-question");
    }
  };

  return (
    <div className={styles["answer-question"]}>
      <div className={styles.img}>
        <img src="/patient.jpg" />
      </div>
      <div className={styles.content}>
        <h2>{questionObj?.question}</h2>
        <p>
          Answer the questions with the movement of your head.
          <span>(right or left)</span>
        </p>
        <div className={styles.btns}>
          <button
            ref={leftButtonRef}
            className={styles["as-btn"]}
            onClick={(e: any) => handleAnswerClick(e)}
          >
            {questionObj?.answers[0]}
          </button>
          <button
            ref={rightButtonRef}
            className={styles["as-btn"]}
            onClick={(e: any) => handleAnswerClick(e)}
          >
            {questionObj?.answers[1]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswerQuestions;
