
import { useState, useEffect, useRef } from "react";
import { FaSpinner } from 'react-icons/fa';
import './Theme.css';
import './Gamewindow.css';
import Gamewindow from "./Gamewindow";
import ScoreBar from "./ScoreBar";
import ControlTools from "./ControlTools";
import generateOptionForContryAndCapital from '../modules/option';
import generateOptionsOtherThanCountryAndCapital from "../modules/generateOption";
import generateQuestionOtherThanCountryAndCapital from "../modules/question";
import checkAnwers from "../modules/checkAnswer";
import gameLevel from "../modules/gameLevel";
import userChallengeProgress from "../modules/userChallengeProgress";
import updateUserStat from "../modules/updateUserStat";
import DuelDetails from "./duelComponent/DuelDetails";

// custome hook
function usePrevious(data){
    const ref = useRef();
    useEffect(()=>{
      ref.current = data
    }, [data])
    return ref.current
}

const Gamespace = (props) => {
    let questionsInCurrentTheme = useRef(null);
    const [challengeTheme, setChallengeTheme] = useState('Contry and Capital');
    const [myThemes, setMyThemes] = useState(null);
    let maxTimmer = useRef(10);
    let timmer = useRef(maxTimmer.current);
    let interval = useRef();
    const questions = useRef();
    const [showStart, setShowStart] = useState(false);
    const [chrono,setChrono] = useState(timmer.current);
    const [showQuestion, setShowQuestion] = useState(false);
    const [showDropLevelList, setShowDropLevelList] = useState(true);
    const [contry, setContry] = useState('');
    const [success, setSuccess] = useState(false);
    const [level, setLevel] = useState('Medium');
    const [duelLevel, setDuelLevel] = useState();
    const [duelTheme, setDuelTheme] = useState();
    const [saveState, setSaveState] = useState('Save');
    const [pauseState, setPauseState] = useState('Pause')
    let scoreIncrement = useRef(1);
    const questionAswersOptions = useRef();
    let questionIndex = useRef(0);
    let score = useRef(0);
    let progressBar = useRef(0);
    const [otherQuestion, setOtherQuestion] = useState('');
    const prevTheme = usePrevious(challengeTheme);
// *************************** FETCH INITAL DATA (THEME AND QUESTIONS) ****************************************/  
useEffect(() => {
    async function data() {
        const data = await fetch('../theme');
        const themes = await data.json();
        window.localStorage.setItem('theme', JSON.stringify(themes));
        const myThemes = JSON.parse(localStorage.getItem('theme'));
        setMyThemes(myThemes);
    }
    data();
    const allQuestions = () => {
        const allQuestions = JSON.parse(localStorage.getItem('userQuestions'));
        console.log(allQuestions);
        allQuestions !== null ? questions.current = allQuestions : console.log('loading...');
        }
    allQuestions();
    const userData = JSON.parse(localStorage.getItem('user'));
    // console.log(userScoreState);
    score.current = userData.data.score.find(({ theme }) => theme === challengeTheme).score;
    questionIndex.current = userData.data.score.find(({ theme }) => theme === challengeTheme).level;
    // console.log(questionIndex.current);
    // progressBar.current = userChallengeProgress(questionIndex.current, questionsInCurrentTheme.current);
}, []);
// *********************************** UPDATE USER GLOBAL DUEL LEVEL ***********************************//
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        userData.duelLevel = level;
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);
// ********************** SET CURRENT QUESTION DEPENDING TO THE THEME CHOSEN ***********************//
    useEffect(() => {
        setShowStart(true);
            if (challengeTheme && questions.current !== null) {
                const currentQuestions = questions.current.filter(question => question.theme === `${challengeTheme}`);
                const currentQuestionsWithCity = currentQuestions.filter(question => question.city !== null);
                questionsInCurrentTheme.current = currentQuestionsWithCity;
                // console.log('current questions', questionsInCurrentTheme);
            }
    }, [challengeTheme]);
//  ******************* START CHALLENGE EVENT HANDLER**********************************//
    const startChallenge = () => {
        generateTheCurrentQuestion();
        setShowStart(false);
        setShowQuestion(true);
        setChronoInterval();
        setShowDropLevelList(false);
        const userData = JSON.parse(localStorage.getItem('user'));
        score.current = userData.data.score.find(({ theme }) => theme === challengeTheme).score;
        // reset();
    }

// **************************** SET GAME TIMER ************************************************************// 
    const setChronoGame = () => {
        setChrono(timmer.current--);
        if (timmer.current === -1) {
            setChrono(timmer.current = maxTimmer.current);
            generateTheCurrentQuestion();
            // return setChrono(timmer.current = maxTimmer.current);
        }
    }
    
    const setChronoInterval = () => {
        interval.current = setInterval(setChronoGame, 1000);
    }

    //**************************************GENERATE THE CURRENT QUESTION********************************/
    
    const generateTheCurrentQuestion = () => {
        if (questionsInCurrentTheme !== 'undefined') {
            const randomMaxValue = questionsInCurrentTheme.current.length + 1;
            const myQuestions = questionsInCurrentTheme.current[questionIndex.current];
            // console.log(myQuestions, 'on index', questionIndex.current);
            setTimeout(() => setContry(myQuestions.question), 1000);
            // console.log(randomMaxValue);
            questionIndex.current++;
            if (!props.isGameDuel && !props.duelSettingReady) {
                if (challengeTheme === 'Contry and Capital') {
                    const answeroptions = generateOptionForContryAndCapital(myQuestions.city, questionsInCurrentTheme.current, contry);
                    questionAswersOptions.current = answeroptions;
                    // console.log(answeroptions);
                    // console.log(display);
                } else {
                    const options = questionsInCurrentTheme.current.map(question => question.options);
                    // console.log(options)
                    const currentQuestion = generateQuestionOtherThanCountryAndCapital(questionsInCurrentTheme.current, questionIndex.current);
                    setOtherQuestion(currentQuestion);
                    // console.log(currentQuestion);
                    const currentOptions = generateOptionsOtherThanCountryAndCapital(options, questionIndex.current);
                    questionAswersOptions.current = currentOptions;
                
                }
                if (questionIndex.current === randomMaxValue) {
                    return reset();
                }
            }
            if (props.isGameDuel && props.duelSettingReady) {
                if (localStorage.getItem('joined-duel-theme') === 'Contry and Capital') {
                    const answeroptions = generateOptionForContryAndCapital(myQuestions.city, questionsInCurrentTheme.current, contry);
                    questionAswersOptions.current = answeroptions;
                    console.log('duel-answers',answeroptions);
                    // console.log(display);
                } else {
                    const options = questionsInCurrentTheme.current.map(question => question.options);
                    // console.log(options)
                    const currentQuestion = generateQuestionOtherThanCountryAndCapital(questionsInCurrentTheme.current, questionIndex.current);
                    setOtherQuestion(currentQuestion);
                    console.log('duel-questions',currentQuestion);
                    const currentOptions = generateOptionsOtherThanCountryAndCapital(options, questionIndex.current);
                    questionAswersOptions.current = currentOptions;
                
                }
                if (questionIndex.current === randomMaxValue) {
                    return reset();
                }
            }

        }
    }
// ********************************* CHECK ANSWERS *********************************************/
    const getAnswer = (e) => {
        e.preventDefault();
        const answer = e.target.innerHTML;
        const answerState = checkAnwers(answer, contry, questionsInCurrentTheme.current);
        if (answerState === true) {
            clearInterval(interval.current);
            score.current += scoreIncrement.current;
           progressBar.current = userChallengeProgress(questionIndex.current, questionsInCurrentTheme.current);
            // console.log(currentProgressBar, '%');
            setSuccess(true)
            answerChecked();
            generateTheCurrentQuestion();
        } else {
            clearInterval(interval.current);
            navigator.vibrate(200);
            setSuccess(false);
            answerChecked();
            generateTheCurrentQuestion();
        }
        // console.log(answer, answerState);
    }

// *************************** ANSWER CHECKED ******************************************//
    const answerChecked = () => {
        timmer.current = maxTimmer.current;
        setChrono(timmer.current);
        setChronoInterval();
        console.log('answerChecked');
    }

// ****************************** RESET THE CHRONO ***********************************************************/
    const reset = () => {
        clearInterval(interval.current);
        timmer.current = maxTimmer.current;
        setChrono(timmer.current);
        setShowQuestion(false);
        setShowStart(true);
        setShowDropLevelList(true);
        console.log('reset');
    }

//**************************** OPEN CHALLENGE EVENT (CLICK ON THEME)********************************************/
    const openChallenge = (e) => {
        console.log('timmer current', timmer.current);
        if (prevTheme !== e.target.innerHTML && !showStart) {
            clearInterval(interval.current);
            prevTheme && setChallengeTheme(prevTheme);
            const confirmResponse = window.confirm('Do want to leave the challenge ?');
            if (confirmResponse) {
                setChallengeTheme(e.target.innerHTML)
                setContry(questionsInCurrentTheme.current[0]);
                setOtherQuestion('');
               return reset();
            }
            else {
                setChrono(timmer.current);
                setChronoInterval();
                questionIndex.current = 0;
            }
        }
        else {
        const userData = JSON.parse(localStorage.getItem('user'));
        // console.log(userScoreState);
        score.current = userData.data.score.find(({ theme }) => theme === e.target.innerHTML).score;
        questionIndex.current = userData.data.score.find(({ theme }) => theme === e.target.innerHTML).level;
        ////////////////////////////////////// set theme for duel usage /////////////////////////////////////
            localStorage.setItem('duelTheme', e.target.innerHTML);
           return setChallengeTheme(e.target.innerHTML);
        }
    }

    return (
        <div className='gamespaceDiv'>
            
            {!props.isGameDuel && <div className='ThemeContainer'>
                <h3>Challenges</h3>
                
                {
                    myThemes ? myThemes.map((theme, i) => (
                        <div className='themeContainer'>
                            <p key={theme.index} className='theme' onClick={openChallenge}>{theme.theme}</p>
                        </div>
                    )) : <p>loading Challenges <FaSpinner className='spaniner' /></p>
                }

            </div>}
            <div className='gameWindowDiv' style={{
                left: props.NewLeftPosition,
                right: props.NewRightPostion
            }}>
                {!props.isGameDuel && !props.duelSettingReady &&<ScoreBar
                    progress={progressBar.current}
                    score={score.current}
                    chrono={chrono}
                    setLevel={(e) => {
                        maxTimmer.current = gameLevel(e, maxTimmer);
                        timmer.current = maxTimmer.current
                        setChrono(timmer.current)
                        if (maxTimmer.current === 20) {
                            setLevel('Low');
                            scoreIncrement.current = 1;
                        }
                        if (maxTimmer.current === 10) {
                            setLevel('Medium');
                            scoreIncrement.current = 5;
                        }
                        if (maxTimmer.current === 5) {
                            setLevel('Hight');
                            scoreIncrement.current = 10;
                        }
                        const userData = JSON.parse(localStorage.getItem('user'));
                        userData.duelLevel = e.target.innerHTML;
                        localStorage.setItem('user', JSON.stringify(userData));
                        // const duelLev = JSON.parse(localStorage.getItem('user')).duelLevel;
                        // console.log('duel Level', duelLev);

                    }}
                    success={success}
                    showDropLevelList={showDropLevelList}
                    level={level}
                />}
                    {props.isGameDuel && props.duelSettingReady &&<ScoreBar
                    progress={progressBar.current}
                    score={score.current}
                    chrono={chrono}
                    setLevel={() => {
                        // const DuelLevel = localStorage.getItem('joined-duel-level')
                        setChallengeTheme(localStorage.getItem('joined-duel-theme'));
                        if (localStorage.getItem('joined-duel-level') === 'Low') {
                            maxTimmer.current = 20;
                            timmer.current = maxTimmer.current;
                            setChrono(timmer.current)
                            setDuelLevel('Low');
                            scoreIncrement.current = 1;
                            console.log('duel-level:', level);
                        }
                        if (localStorage.getItem('joined-duel-level') === 'Medium') {
                            maxTimmer.current = 10;
                            timmer.current = maxTimmer.current;
                            setChrono(timmer.current)
                            setDuelLevel('Medium');
                            console.log('duel-level', level);
                            scoreIncrement.current = 5;
                        }
                        if (localStorage.getItem('joined-duel-level') === 'Hight') {
                            maxTimmer.current = 5;
                            timmer.current = maxTimmer.current;
                            setChrono(timmer.current)
                            setDuelLevel('Hight');
                            scoreIncrement.current = 10;
                            console.log('duel-level', level);
                        }
                    }}
                    success={success}
                    showDropDuelLevelList={true}
                    level={duelLevel}
                />}
                <ControlTools
                    save={saveState}
                    pause={pauseState}
                    saveHandler={() => {
                        if (!showStart) {
                            updateUserStat(score.current, prevTheme, questionIndex.current);
                            setSaveState('Saved');
                            const setToSave = () => { setSaveState('Save') }
                            setTimeout(setToSave, 2000);
                        }
                    }}
                    pauseHandler={() => {
                        if (!showStart) {
                            if (pauseState === 'Pause') {
                                clearInterval(interval.current);
                                setPauseState('Resume');
                            } else {
                                setChrono(timmer.current);
                                setChronoInterval();
                                setPauseState('Pause');
                            }
                        }
                    }}
                />
                {!props.isGameDuel && !props.duelSettingReady &&<Gamewindow
                    startChallenge={startChallenge}
                    showButton={showStart}
                    challengeTheme={challengeTheme}
                    showQuestion={showQuestion}
                    contry={contry}
                    answerOption={questionAswersOptions.current}
                    question={otherQuestion}
                    getAnswer={getAnswer}
                />}
                {props.isGameDuel && props.duelSettingReady && <Gamewindow
                    startChallenge={startChallenge}
                    showButton={showStart}
                    challengeTheme={localStorage.getItem('joined-duel-theme')}
                    showQuestion={showQuestion}
                    contry={contry}
                    answerOption={questionAswersOptions.current}
                    question={otherQuestion}
                    getAnswer={getAnswer}
                />}
            </div>
        </div>
    );
}

export default Gamespace;