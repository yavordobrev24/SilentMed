import { useState, ChangeEvent,useEffect } from 'react';
import styles from "./CreateQuestion.module.css";
import commonStyles from "../Common.module.css";
import { useNavigate } from 'react-router-dom';

interface Question {
  question: string;
  answers: string[];
}

export default function CreateQuestion(): JSX.Element {
  const [question, setQuestion] = useState<Question>({
    question: '',
    answers: ['', ''],
  });
  const [count,setCount] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let numberOfQuestionsString:any = sessionStorage.getItem("numQuestions");
    numberOfQuestionsString = JSON.parse(numberOfQuestionsString);
    if (numberOfQuestionsString-count<0) {
      navigate("/answer-question")
    }else{
      setQuestion({
        question: '',
        answers: ['', ''],
      });
    }
  }, [count]);

  const handleCreateQuestion = (question:Question) => {
    if (question.question.trim() === '' || question.answers.some(answer => answer.trim() === '')) {
      setError('Please fill in all input fields.');
    } else {
      setError(null);
    
    const questionsString:any = sessionStorage.getItem("questions");
    const questionsParsed = JSON.parse(questionsString);
    questionsParsed.push(question);
    sessionStorage.setItem("questions", JSON.stringify(questionsParsed));
    setCount((old)=>old+1);
   }
  };

  const handleQuestionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuestion({
      ...question,
      question: e.target.value,
    });
  };

  const handleAnswerChange = (answerIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...question.answers];
    newAnswers[answerIndex] = e.target.value;
    setQuestion({
      ...question,
      answers: newAnswers,
    });
  };

  return (
    <div className={styles["create-question"]}>
      <div className={styles["question-container"]}>
        <h2>Question {count}</h2>
      <div className={styles.seperator}>
        </div>  
        <div className={commonStyles["input-wrapper"]}>
          <input type="text" required onChange={handleQuestionChange} value={question.question} />
          <span>Question</span>
        </div>
        {question.answers.map((answer, index) => (
          <div key={index}>
            <div className={commonStyles["input-wrapper"]}>
              <input type="text" required onChange={(e) => handleAnswerChange(index, e)} value={answer} />
              <span>{`Answer ${index + 1}`}</span>
            </div>
          </div>
        ))}
        {error && <div className={commonStyles["error-message"]}>{error}</div>}  
          <button className={commonStyles.btn} onClick={()=>handleCreateQuestion(question)}>
          <span>Submit Question</span>
        </button>
      </div>
    </div>
  );
}
/**import { useEffect, useState } from "react";
import styles from "./AnswerQuestion.module.css";
import { useNavigate } from "react-router-dom";

interface Question {
  question: string;
  answers: string[];
}

interface AnsweredQuestion {
  question: string;
  answer: string;
}

const AnswerQuestions = () => {
  const [questionObj, setQuestionObj] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedQuestionsString = sessionStorage.getItem("questions");

    if (storedQuestionsString) {
      const storedQuestions: Question[] = JSON.parse(storedQuestionsString);

      if (storedQuestions.length > 0) {
        setQuestionObj(storedQuestions[0]); 
      } else {
        sessionStorage.removeItem("questions");
        sessionStorage.setItem("answeredQuestions", JSON.stringify(answeredQuestions));
        navigate("/answer-summary");
      }
    }
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
      setAnsweredQuestions((prevAnsweredQuestions) => [...prevAnsweredQuestions, answeredQuestion]);
    }
  };

  return (
    <div className={styles['answer-question']}>
      {questionObj && (
        <>
          <h2>{questionObj.question}</h2>
          <div className={styles['btn-group']}>
            <button onClick={() => handleAnswerClick(questionObj.answers[0])}>
              {questionObj.answers[0]}
            </button>
            <button onClick={() => handleAnswerClick(questionObj.answers[1])}>
              {questionObj.answers[1]}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AnswerQuestions;
 */