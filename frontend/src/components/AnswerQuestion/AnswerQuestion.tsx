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
  const [answeredQuestions, setAnsweredQuestions] = useState<
    AnsweredQuestion[]
  >([]);
  const navigate = useNavigate();

  // Refs for the answer buttons
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedQuestionsString = sessionStorage.getItem("questions");

    if (storedQuestionsString) {
      const storedQuestions: Question[] = JSON.parse(storedQuestionsString);

      if (storedQuestions.length > 0) {
        setQuestionObj(storedQuestions[0]);
      } else {
        sessionStorage.removeItem("questions");
        sessionStorage.setItem(
          "answeredQuestions",
          JSON.stringify(answeredQuestions)
        );
        navigate("/answer-summary");
      }
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
          // Hover over the right button
          rightButtonRef.current?.classList.add(styles.hovered);
          leftButtonRef.current?.classList.remove(styles.hovered);
          // Set a timeout to click the button after 2 seconds
          setTimeout(() => {
            //   rightButtonRef.current?.click();
          }, 3000);
        } else {
          console.log("Left");
          // Hover over the left button
          leftButtonRef.current?.classList.add(styles.hovered);
          rightButtonRef.current?.classList.remove(styles.hovered);
          // Set a timeout to click the button after 2 seconds
          setTimeout(() => {
            //   leftButtonRef.current?.click();
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Fetch data initially
    fetchData();

    // Schedule subsequent requests every 1 second
    const fetchDataInterval = setInterval(fetchData, 1000);

    return () => {
      // Clear the interval when the component is unmounted
      clearInterval(fetchDataInterval);
    };
  }, [answeredQuestions, navigate]);

  const handleAnswerClick = (selectedAnswer: string) => {
    if (questionObj) {
      const answeredQuestion: AnsweredQuestion = {
        question: questionObj.question,
        answer: selectedAnswer,
      };
      const storedQuestionsString = sessionStorage.getItem("questions");
      if (storedQuestionsString) {
        const storedQuestions: Question[] = JSON.parse(storedQuestionsString);

        const answeredQuestionIndex = storedQuestions.findIndex(
          (q) => q.question === answeredQuestion.question
        );

        if (answeredQuestionIndex !== -1) {
          const updatedQuestions = [
            ...storedQuestions.slice(0, answeredQuestionIndex),
            ...storedQuestions.slice(answeredQuestionIndex + 1),
          ];

          sessionStorage.setItem("questions", JSON.stringify(updatedQuestions));

          setQuestionObj(updatedQuestions[answeredQuestionIndex]);
        }
      }
      setAnsweredQuestions((prevAnsweredQuestions) => [
        ...prevAnsweredQuestions,
        answeredQuestion,
      ]);
    }
  };

  return (
    <div className={styles["answer-question"]}>
      {questionObj && (
        <>
          <h2>{questionObj.question}</h2>
          <div className={styles["btn-group"]}>
            <button
              ref={leftButtonRef}
              onClick={() => handleAnswerClick(questionObj.answers[0])}
            >
              {questionObj.answers[0]}
            </button>
            <button
              ref={rightButtonRef}
              onClick={() => handleAnswerClick(questionObj.answers[1])}
            >
              {questionObj.answers[1]}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnswerQuestions;
