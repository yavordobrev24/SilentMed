import styles from "./Home.module.css";
import { Link } from "react-router-dom";

export default function Home(){
    return(<div className={styles.home}>
    <Link className={styles.btn} to="/create-question">Create A Question</Link>
    <Link className={styles.btn} to="/create-survey">Create A Survey</Link>
    </div>)

}