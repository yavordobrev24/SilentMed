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

const ACCZ_THRESHOLD = 0;

const AnswerQuestions = () => {
  const [questionObj, setQuestionObj] = useState<Question | null>(null);
  const [side, setSide] = useState<string | null>(null);
  const navigate = useNavigate();

  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const questionString = sessionStorage.getItem("question");
    let count = 0;
    if (questionString) {
      const questionParsed: Question = JSON.parse(questionString);
      setQuestionObj(questionParsed);
    }
    const fetchData = async () => {
      if (count == 4) {
        if (side == "right") {
          rightButtonRef.current?.click();
          console.log(side, " chosen");
        } else {
          leftButtonRef.current?.click();
          console.log(side, " chosen");
        }
      }
      try {
        const response = await fetch(file);
        const data = await response.text();
        const lines = data.split("\n");
        const lastestData = lines[lines.length - 2];
        const parsedData = JSON.parse(lastestData);
        const ACCZ = parsedData.mot[8];
        const newSide = ACCZ < ACCZ_THRESHOLD ? "left" : "right";
        if (side === newSide) {
          count = count + 1;
        } else {
          count = 0;
          setSide(newSide);
        }
        if (side == "right") {
          rightButtonRef.current?.classList.add(styles.hovered);
          leftButtonRef.current?.classList.remove(styles.hovered);
        } else {
          leftButtonRef.current?.classList.add(styles.hovered);
          rightButtonRef.current?.classList.remove(styles.hovered);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchData();
    const fetchDataInterval = setInterval(fetchData, 1000);

    return () => {
      clearInterval(fetchDataInterval);
    };
  }, [setQuestionObj, navigate, side]);

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
