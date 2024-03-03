import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import styles from "./Summary.module.css";

import { Pagination, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ReplayIcon from "@mui/icons-material/Replay";

type Page = {
  question: string;
  answer: string;
};
const Summary = () => {
  const [pages, setPages] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const answeredQuestionsStringified =
      sessionStorage.getItem("answeredQuestions");
    if (answeredQuestionsStringified) {
      const answeredQuestions = JSON.parse(answeredQuestionsStringified);
      setPages(answeredQuestions);
    }
  }, []);
  const currentPage: Page = pages[pageNumber - 1];
  const handleRetry = () => {
    sessionStorage.clear();
    sessionStorage.setItem("answeredQuestions", JSON.stringify([]));
    navigate("/create-question");
  };
  return (
    <div className={styles.summary}>
      {currentPage && (
        <div className={styles.page}>
          <h2>{currentPage.question}</h2>

          <p>{currentPage.answer}</p>
        </div>
      )}
      <div className={styles.actions}>
        <Tooltip title="Another Questionnaire">
          <button onClick={handleRetry}>
            <ReplayIcon className={styles.retry} />
          </button>
        </Tooltip>
        <Tooltip title="Go To Main Page">
          <button className={styles.home}>
            <Link to="/">
              <HomeIcon />
            </Link>
          </button>
        </Tooltip>
      </div>

      <Pagination
        className={styles.pagination}
        count={pages.length}
        page={pageNumber}
        onChange={(_, newPage) => setPageNumber(newPage)}
      />
    </div>
  );
};

export default Summary;
