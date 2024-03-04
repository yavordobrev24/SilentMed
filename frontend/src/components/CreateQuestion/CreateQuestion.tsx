import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./CreateQuestion.module.css";

import TextField from "@mui/material/TextField";
import SummarizeIcon from "@mui/icons-material/Summarize";
import Tooltip from "@mui/material/Tooltip";

interface Question {
  question: string;
  answers: string[];
}

export default function CreateQuestion(): JSX.Element {
  const [question, setQuestion] = useState<Question>({
    question: "",
    answers: ["", ""],
  });
  const [canSummarize, setCanSummarize] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    let hasQuestion: string | null = sessionStorage.getItem("question");
    if (hasQuestion) {
      navigate("/answer-question");
    }
    let answeredQuestionsString = sessionStorage.getItem("answeredQuestions");
    if (answeredQuestionsString) {
      let answeredQuestions = JSON.parse(answeredQuestionsString);
      if (answeredQuestions.length > 0) {
        setCanSummarize(true);
      } else {
        setCanSummarize(false);
      }
    }
  }, [question, error]);

  const handleCreateQuestion = (question: Question) => {
    if (
      question.question.trim() === "" ||
      question.answers.some((answer) => answer.trim() === "")
    ) {
      setError("Please fill in all input fields.");
    } else {
      const questionStringified: string = JSON.stringify(question);
      sessionStorage.setItem("question", questionStringified);
      setError(() => null);
      setQuestion({
        question: "",
        answers: ["", ""],
      });
    }
  };

  const handleQuestionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuestion({
      ...question,
      question: e.target.value,
    });
  };

  const handleAnswerChange = (
    answerIndex: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const newAnswers = [...question.answers];
    newAnswers[answerIndex] = e.target.value;
    setQuestion({
      ...question,
      answers: newAnswers,
    });
  };

  return (
    <div className={styles["create-question"]}>
      <div className={styles.content}>
        <h2>Create question</h2>
        <p>After which the patients can answer directly.</p>
        <section className={styles.form}>
          <TextField
            id="filled-basic"
            onChange={handleQuestionChange}
            value={question.question}
            label="Question"
            className={styles.input}
            variant="filled"
            required
          />
          {question.answers.map((answer, index) => (
            <TextField
              key={index}
              className={styles.input}
              id="filled-basic"
              label={`Answer ${index + 1}`}
              variant="filled"
              required
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleAnswerChange(index, e)
              }
              value={answer}
            />
          ))}
          {error && <div>{error}</div>}
          <div className={styles.btns}>
            <button
              className={styles["cq-btn"]}
              onClick={() => handleCreateQuestion(question)}
            >
              Create
            </button>
            {canSummarize && (
              <Tooltip title="Summarize">
                <a href="/summary" className={styles.summarize}>
                  <SummarizeIcon />
                </a>
              </Tooltip>
            )}
          </div>
        </section>
      </div>
      <div className={styles.img}>
        <img src="/doctor.jpg" />
      </div>
    </div>
  );
}
