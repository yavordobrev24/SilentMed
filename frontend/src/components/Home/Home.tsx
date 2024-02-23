import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import commonStyles from "../Common.module.css"
import { useEffect } from "react";
export default function Home(){
    useEffect(()=>{
        sessionStorage.removeItem("submittedQuestions");
        sessionStorage.removeItem("answeredQuestions");
        sessionStorage.removeItem("questions");
        sessionStorage.removeItem("numQuestions");
    },[])
    return(<div className={styles.wrapper}>
        <div className={styles.logo}>
            <img src="/logo.svg" alt="SilentMed logo" />
        </div>
        <div className={styles["btn-wrapper"]}>
            <Link className={commonStyles.btn} to="/create-questions">Create Questions</Link>
        </div>
    </div>)

}