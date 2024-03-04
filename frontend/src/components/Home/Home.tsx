import styles from "./Home.module.css";

import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    sessionStorage.clear();
  }, [navigate]);

  const handleClick = () => {
    sessionStorage.setItem("answeredQuestions", JSON.stringify([]));
    navigate("/create-question");
  };

  return (
    <div className={styles.home}>
      <section className={styles.header}>
        <div className={styles.logo}>
          <img src="/logo.svg" alt="silentmed logo" />
        </div>
        <nav>
          <ul>
            <li>
              <a href="#how-it-works">How It Works?</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li className={styles["gs-btn"]} onClick={handleClick}>
              <Link to="/create-question">Get Started</Link>
            </li>
          </ul>
        </nav>
      </section>
      <section className={styles.hero}>
        <h1>Unlock Your Voice.</h1>
        <p>Empowering silent voices through cutting-edge EEG technology.</p>
        <a href="#how-it-works">Discover How</a>
      </section>
      <section className={styles["about"]} id="about">
        <h2>About</h2>
        <p>
          SilentMed is an innovative project that uses EEG technology to help
          people with communication disabilities answer medical questionnaires.
          The device reads head movements, allowing users to interact directly
          with questions posed by doctors.
        </p>
      </section>
      <section className={styles["how-it-works"]} id="how-it-works">
        <h2>How It Works</h2>
        <div className={styles["cards-wrapper"]}>
          <div className={styles.card}>
            <h3>1</h3>
            <p>
              Connect the EEG device. Make sure the contact quality is above
              50%.
            </p>
          </div>
          <div className={styles.card}>
            <h3>2</h3>
            <p>
              To begin creating questions the medical expert should go to
              <a onClick={handleClick}> Create Question </a> and start asking
              the patient questions.
            </p>
          </div>
          <div className={styles.card}>
            <h3>3</h3>
            <p>
              Once the doctor has created a question the patient can begin
              answering using head movements as their primary method of input.
            </p>
          </div>
        </div>
      </section>

      <section className={styles["footer"]}>
        <div className={styles.socials}>
          <a href="https://github.com/yavordobrev24">
            <GitHubIcon />
          </a>
          <a href="https://www.linkedin.com/in/yavor-dobrev-0991b827a">
            <LinkedInIcon />
          </a>
        </div>
      </section>
    </div>
  );
}
