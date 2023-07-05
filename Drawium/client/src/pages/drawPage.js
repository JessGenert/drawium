import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Canvas, { getCanvasBlob } from "../components/canvas";
import CanvasMobile from "../components/canvasMobile";
import Table, { savePlayers } from "../components/table";
import Colours from "../components/toolsAndColors";
import ColoursMobile from "../components/toolsAndColorsMobile";
import { SocketContext } from "../utilities/sockets";
import SecureLS from 'secure-ls'
const ls = new SecureLS({ encodingType: 'aes' })


export default function Drawpage() {

    const username = useRef('');
    const turn = useRef(0);
    const guessCount = useRef(0);
    const word = useRef('');
    const prevWordHidden = useRef('');
    const wordHidden = useRef('');
    const reveal = useRef(0);
    const secondReveal = useRef(0);
    const thirdReveal = useRef(0);
    const fourthReveal = useRef(0);
    const socket = useContext(SocketContext);
    const currentRound = useRef(1);
    const numberOfRounds = useRef(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const [wordToDraw, setWordToDraw] = useState('');
    const [wordsToChoose, setWordsToChoose] = useState([]);
    const [showWordChoice, setShowWordChoice] = useState(false);
    const [turnToDraw, setTurnToDraw] = useState(false);
    const [hideGuessBox, setHideGuessBox] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeToDraw, setTimeToDraw] = useState(false);
    const [guessForm, setGuessForm] = useState({ guess: '' });
    const timerCount = useRef(0);
    const [gameOwner, setGameOwner] = useState(false);
    const nowAndTime = Math.floor(Date.now() / 1000) + 30;
    const now = Math.floor(Date.now() / 1000);
    const [start, setStart] = useState(nowAndTime);
    const [timer, setTimer] = useState(now);
    const counter = start - timer;
    const hasTimerEnded = counter <= 0;
    const intervalID = null;
    const [hideAnswer, setHideAnswer] = useState(true);
    const gameID = searchParams.get('gameId');
    const currentPlayers = useRef([])
    const isRound= useRef(false)

    //#region round options
    const options = [
        {
            label: 'One Round',
            value: 1,
        },
        {
            label: 'Two Rounds',
            value: 2,
        },
        {
            label: 'Three Rounds',
            value: 3,
        },
        {
            label: 'Four Rounds',
            value: 4,
        },
        {
            label: 'Five Rounds',
            value: 5,
        },
        {
            label: 'Six Rounds',
            value: 6,
        },
    ];
    //#endregion









    useEffect(() => {
        socket.on('updateGameOwner', (players) => {
            currentPlayers.current = players;
            if (currentPlayers.current[0].username === username.current) {
                setGameOwner(true);
            } else {
                setGameOwner(false);
            }
        })
        return () => socket.off('updateGameOwner')
    }, [])





    useEffect(() => {
        (async function getGameInfo() {
            let info = ls.get('user')
            username.current = info.username;
            events(username.current, info._id, info.avatar, 0);
        })();

        function events(username, userid, avatar, score) {
            socket.emit('create-room', gameID, username, userid, avatar, score);

        }


    }, []);



    function setNumberOfRounds(value) {
        numberOfRounds.current =  parseInt(value);
        isRound.current = true;
        console.log("numberOfRounds - set", numberOfRounds.current)
    }

    //#region This is just the sockets that emit the start of the game and timer for everyone
    function startGame(e) {
        e.preventDefault();
        socket.emit('startTimer', gameID);
        socket.emit('gameStart', gameID);
    }
    //#endregion

    //#region Timer deploy
    useEffect(() => {
        socket.on('startTimer', () => {
            const intervalID = setInterval(() => setTimer(Math.floor(Date.now() / 1000)), 1);
            return () => clearInterval(intervalID);
        });
        return () => { socket.off('startTimer'); }
    }, []);
    //#endregion

    //#region socket for starting game

    useEffect(() => {
        socket.on('gameStart', () => {
            getGameStarted();
            setSearchParams({ 'gameId': gameID, 'started': 'true', 'status': 'false' });
            timerCount.current = 0;
            socket.emit('clear', gameID)
            playerTurn();
            setGameStarted(true);
        });
        return () => { socket.off('gameStart'); };
    }, []);
    //#endregion

    //#region function to control games list

    // I created this function to control whether the game is listed in the games list in the lobby
    // I made it so you couldn't join a game in progress because that doesnt work

    async function getGameStarted() {
        await axios.put(`/api/updateGameStatus/${gameID}`, { started: true });
    }
    //#endregion

    //#region handle the players turn and setting what is visible for everyone 
    
    
    const playerTurn = () => {
        console.log("plyaer turn current round", currentRound.current);
        console.log("player turn current turn", turn.current)
        setHideAnswer(true);
        setHideGuessBox(true);
        if (currentPlayers.current[turn.current].username === username.current) {
            socket.emit('words', gameID);
            setTurnToDraw(true);
            setShowWordChoice(true);
            setTimeToDraw(false);
        }
        else {

            setTurnToDraw(false);
            setShowWordChoice(false);
            setTimeToDraw(false);
        }
        setHiddenWord('');
        setStart(Math.floor(Date.now() / 1000) + 30);
        setTimer(Math.floor(Date.now() / 1000));

    }
    // #endregion






    useEffect(() => {
        socket.on('words', (yourWords) => { setWordsToChoose(yourWords); });
        return () => { socket.off('words'); };
    }, []);

    //#region  this funtion handles if you actually choose a word rather than letting the timer run out
    // and having the word chosen for you
    function handleChoice(value) {
        word.current = value;
        let data = {
            start: Math.floor(Date.now() / 1000) + 150,
            word: word.current,
            timer: Math.floor(Date.now() / 1000),
            showWordChoice: false,
            timeToDraw: true,
            turnCount: turn.current + 1,
            timerCount: 1
        };
        socket.emit('word', data, gameID);
        socket.emit('toolP');
    }
    //#endregion



    //#region this is the place where I switch timers from choosing a word to the guessing and drawing phase
    //this automatically chooses a word for you if the timer runs out

    useEffect(() => {
        if (hasTimerEnded && timerCount.current === 0 && turnToDraw) {

            let index = Math.floor(Math.random() * 3);
            word.current = wordsToChoose[index];

            let data = {
                start: Math.floor(Date.now() / 1000) + 150,
                word: word.current,
                timer: Math.floor(Date.now() / 1000),
                showWordChoice: false,
                timeToDraw: true,
                turnCount: turn.current + 1,
                timerCount: 1
            };
            socket.emit('word', data, gameID);
            socket.emit('toolP');
        }

    }, [hasTimerEnded]);
    //#endregion

    //#region this is where the word data gets sent to each client so that they can guess it
    //it also controls the timer and syncs it for each client as well as a few other things that it syncs
    useEffect(() => {
        socket.on('word', (data) => {
            setWordToDraw(data.word);
            setHiddenWord(data.word);
            setStart(data.start);
            setShowWordChoice(data.showWordChoice);
            setTimeToDraw(data.timeToDraw);
            setTimer(data.timer);
            turn.current = data.turnCount;
            timerCount.current = data.timerCount;
            if (currentPlayers.current[turn.current - 1].username !== username.current) {
                setHideGuessBox(false);
            }
        });
        return () => { socket.off('word'); };
    });
    //#endregion

    //#region setting the hidden word
    function setHiddenWord(value) {
        if (wordHidden.current === prevWordHidden.current) {
            wordHidden.current = "";
            if (value) {
                for (let i = 0; i < value.length; i++) {
                    if (value.charAt(i) === ' ') {
                        wordHidden.current += '&ensp;&ensp;';
                    } else if (value.indexOf(value.charAt(i)) === value.length - 1) {
                        wordHidden.current += '<u>  </u>';
                    }
                    else {
                        wordHidden.current += '<u>  </u>&nbsp;';
                    }
                }
            }
        }
        prevWordHidden.current = wordHidden.current;
    }
    //#endregion 



    async function saveCanvas(user, word) {
        let blobFile = await getCanvasBlob();

        function blobToBase64(blob) {
            return new Promise((resolve, _) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }
        let blobText = await blobToBase64(blobFile)

        let drawingToSave = {
            _id: user,
            word: word,
            url: `${user}/${gameID}/${word}.jpg`,
            blobFile: blobText,
            gameID: gameID
        }

        await axios.put('/api/drawing', drawingToSave)

    }



    useEffect(() => {


        if (hasTimerEnded && timerCount.current === 1) {
            timerCount.current = 0
            saveCanvas(currentPlayers.current[turn.current - 1].userid, wordToDraw);
            let newTurn = true
            socket.emit('clear', gameID, newTurn);

            if (turn.current === currentPlayers.current.length) {
                currentRound.current = currentRound.current + 1;
                turn.current = 0;
                console.log(currentRound.current, numberOfRounds.current)
                if (currentRound.current > numberOfRounds.current && isRound.current) {
                    console.log(currentRound.current, numberOfRounds.current)
                    endGame()
                    savePlayers();
                } 
               
            }
            playerTurn();
        }

    }, [hasTimerEnded]);



    //#region submitting word and increment scoring if the guess is correct
    async function onSubmit(e) {
        e.preventDefault();

        if (guessForm.guess.toLowerCase() === wordToDraw.toLowerCase()) {
            let indexOfPlayer = currentPlayers.current.map(function (player) { return player.username; }).indexOf(username.current);
            let updatedScore = currentPlayers.current[indexOfPlayer].score + (counter * 8) + (Math.floor(window.performance.now()) % 10);
            currentPlayers.current[indexOfPlayer].score = updatedScore;
            let data = {
                score: updatedScore,
                index: indexOfPlayer
            };

            sendScores(data);
            setHideGuessBox(true);
            setHideAnswer(false);
        }
        setGuessForm({ guess: '' });
    }
    //#endregion

    //#region function that emits the scores and how many people have guessed correctly to everyone
    function sendScores(data) {
        socket.emit('scores', data, gameID);
        socket.emit('guessCount', gameID);
    }
    //#endregion

    useEffect(() => {
        socket.on('guessCount', () => {

            guessCount.current = guessCount.current + 1;
            if (guessCount.current >= currentPlayers.current.length - 1 && currentPlayers.current.length !== 1) {
                setStart(Math.floor(Date.now() / 1000) + 10);
                setTimer(Math.floor(Date.now() / 1000));
                guessCount.current = 0;
            }
        });
        return () => { socket.off('guessCount'); };
    }, []);

    //#region This function just updates the form value for guessing
    function updateForm(value) {
        return setGuessForm((prev) => {
            return { ...prev, ...value };
        });
    }
    //#endregion


    //#region diplay hints for the word
    useEffect(() => {
        if (counter === 120) {
            let wordReveal = wordHidden.current.split("&nbsp;");
            let word = wordToDraw;
            let wordDraw = word.replace(" ", "");
            let index, index2, index3;
            if (wordDraw.indexOf(' ') !== -1) {
                wordDraw = wordDraw.replace(" ", "");
            }
            if (wordReveal.includes(' ')) {
                index = wordReveal.indexOf(' ');
                wordReveal = wordReveal.splice(index, 1);
                if (wordReveal.includes(' ')) {
                    index2 = wordReveal.indexOf(' ');
                    wordReveal = wordReveal.splice(index2, 1);
                    if (wordReveal.includes(' ')) {
                        index3 = wordReveal.indexOf(' ');
                        wordReveal = wordReveal.splice(index3, 1);
                    }
                }
            }
            reveal.current = Math.floor(Math.random() * wordReveal.length);
            wordReveal[reveal.current] = wordDraw[reveal.current];
            if (index) {
                wordReveal = wordReveal.splice(index, 1, ' ');
                if (index2) {
                    wordReveal = wordReveal.splice(index2, 1, ' ');
                    if (index3) {
                        wordReveal = wordReveal.splice(index3, 1, ' ');
                    }
                }
            }
            wordHidden.current = wordReveal.join('&nbsp;');


            secondReveal.current = reveal.current;
            thirdReveal.current = reveal.current;
            fourthReveal.current = reveal.current;
        }
        if (counter === 90) {
            if (wordToDraw.length > 4) {
                let wordReveal = wordHidden.current.split("&nbsp;");
                let word = wordToDraw;
                let wordDraw = word.replace(" ", "");
                let index, index2, index3;
                if (wordDraw.indexOf(' ') !== -1) {
                    wordDraw = wordDraw.replace(" ", "");
                }
                if (wordReveal.includes(' ')) {
                    index = wordReveal.indexOf(' ');
                    wordReveal = wordReveal.splice(index, 1);
                    if (wordReveal.includes(' ')) {
                        index2 = wordReveal.indexOf(' ');
                        wordReveal = wordReveal.splice(index2, 1);
                        if (wordReveal.includes(' ')) {
                            index3 = wordReveal.indexOf(' ');
                            wordReveal = wordReveal.splice(index3, 1);
                        }
                    }
                }

                while (reveal.current === secondReveal.current) {
                    secondReveal.current = Math.floor(Math.random() * wordReveal.length);
                }

                wordReveal[secondReveal.current] = wordDraw[secondReveal.current];
                if (index) {
                    wordReveal = wordReveal.splice(index, 1, ' ');
                    if (index2) {
                        wordReveal = wordReveal.splice(index2, 1, ' ');
                        if (index3) {
                            wordReveal = wordReveal.splice(index3, 1, ' ');
                        }
                    }
                }
                wordHidden = wordReveal.join('&nbsp;');
            }

        }
        if (counter === 60) {
            if (wordToDraw.length > 6) {

                let wordReveal = wordHidden.current.split("&nbsp;");
                let word = wordToDraw;
                let wordDraw = word.replace(" ", "");
                let index, index2, index3;
                if (wordDraw.indexOf(' ') !== -1) {
                    wordDraw = wordDraw.replace(" ", "");
                }
                if (wordReveal.includes(' ')) {
                    index = wordReveal.indexOf(' ');
                    wordReveal = wordReveal.splice(index, 1);
                    if (wordReveal.includes(' ')) {
                        index2 = wordReveal.indexOf(' ');
                        wordReveal = wordReveal.splice(index2, 1);
                        if (wordReveal.includes(' ')) {
                            index3 = wordReveal.indexOf(' ');
                            wordReveal = wordReveal.splice(index3, 1);
                        }
                    }
                }
                while (reveal.current === thirdReveal.current || thirdReveal.current === secondReveal.current) {
                    thirdReveal.current = Math.floor(Math.random() * wordReveal.length);
                }
                wordReveal[thirdReveal.current] = wordDraw[thirdReveal.current];
                if (index) {
                    wordReveal = wordReveal.splice(index, 1, ' ');
                    if (index2) {
                        wordReveal = wordReveal.splice(index2, 1, ' ');
                        if (index3) {
                            wordReveal = wordReveal.splice(index3, 1, ' ');
                        }
                    }
                }
                wordHidden = wordReveal.join('&nbsp;');
            }
        }
        if (counter === 30) {
            if (wordToDraw.length > 9) {

                let wordReveal = wordHidden.current.split("&nbsp;");
                let word = wordToDraw;
                let wordDraw = word.replace(" ", "");
                let index, index2, index3;
                if (wordDraw.indexOf(' ') !== -1) {
                    wordDraw = wordDraw.replace(" ", "");
                }
                if (wordReveal.includes(' ')) {
                    index = wordReveal.indexOf(' ');
                    wordReveal = wordReveal.splice(index, 1);
                    if (wordReveal.includes(' ')) {
                        index2 = wordReveal.indexOf(' ');
                        wordReveal = wordReveal.splice(index2, 1);
                        if (wordReveal.includes(' ')) {
                            index3 = wordReveal.indexOf(' ');
                            wordReveal = wordReveal.splice(index3, 1);
                        }
                    }
                }
                while (reveal.current === fourthReveal.current || fourthReveal.current === secondReveal.current || thirdReveal.current === fourthReveal.current) {
                    fourthReveal.current  = Math.floor(Math.random() * wordReveal.length);
                }
                wordReveal[fourthReveal.current ] = wordDraw[fourthReveal.current ];
                if (index) {
                    wordReveal = wordReveal.splice(index, 1, ' ');
                    if (index2) {
                        wordReveal = wordReveal.splice(index2, 1, ' ');
                        if (index3) {
                            wordReveal = wordReveal.splice(index3, 1, ' ');
                        }
                    }
                }
                wordHidden.current = wordReveal.join('&nbsp;');
            }
        }

    }, [counter]);

    //#endregion




    //#region socket that controls the view of everyone after the game ends and hides various elememts and ends the timer

   
        
        socket.on('endGame', () => {
            console.log("ending game...")
            setGameStarted(false);
            setShowWordChoice(false);
            setTurnToDraw(false);
            setTimeToDraw(false);
            setWordsToChoose([]);
            clearInterval(intervalID);
            setHideGuessBox(true);
            setGameOver(true);
            setTimer(0);
            setStart(0);
            setSearchParams({ 'gameStatus': 'false' });
        });
    //#endregion


    //#region function that emits the end of the game for everyone
    function endGame() {
        socket.emit('saveScores', gameID);
        socket.emit('endGame', gameID);
    }
    //#endregion


    return (
        <div>
            <div id="drawPageContainer" class="d-none d-xs-none d-sm-none d-md-none d-lg-flex">
                <div id='timerRoundAndWord' hidden={!gameStarted}>
                    <div id='round'>Round: {currentRound.current}</div>
                    <div id='timer' hidden={!timeToDraw}>Time Left:&nbsp;&nbsp;{counter}</div>
                    <div id='hiddenWord' hidden={showWordChoice && !turnToDraw}><pre dangerouslySetInnerHTML={{ __html: wordHidden.current }}></pre></div>
                </div>
                <Table />
                <div id='data' hidden={gameOver} >

                    <Canvas />
                    <div id='guess' hidden={(hideGuessBox || turnToDraw) || !gameStarted}>
                        <form onSubmit={onSubmit} id='guessForm'>
                            <input className='form-control form-control-lg' id='guessBox' value={guessForm.guess} onChange={(e) => updateForm({ guess: e.target.value })} />
                            <input type='submit' className='btn btn-success' id='btnGuess' value='Guess' />
                        </form>
                    </div>
                    <div id='answer' hidden={(hideAnswer || turnToDraw) || !gameStarted}>
                        <div id='answerText'>Correct! it was: {wordToDraw}</div>
                    </div>
                    <div id='guess' hidden={gameStarted || gameOver || !gameOwner}>
                        <select className='form-select form-select-lg' id='rounds' onChange={(e) => setNumberOfRounds(e.target.value)} >
                            {options.map((option, index) => (
                                <option value={option.value} key={index}>{option.label}</option>
                            ))}
                        </select>
                        <input className='btn' id='btnGuess' value='Start Game' onClick={(e) => startGame(e)} />
                    </div>
                    <div id='showWordChoice' hidden={!showWordChoice}>
                        <div id='chooseWord'>
                            {wordsToChoose.map((data, index) => { return <input type='submit' className='btn' id='btnChooseWord' key={index} value={data} onClick={() => handleChoice(data)}></input>; })}
                        </div>
                        <div id='chooseWordText'>Choose a word!</div>
                        <div id='chooseWordTimer'>{counter}</div>
                    </div>
                    <div id='chosenWordText' hidden={showWordChoice || !turnToDraw || !gameStarted}>You are drawing: {wordToDraw}</div>
                </div>
                <div id='colorsHide' hidden={!turnToDraw || !gameStarted}>
                    <Colours />
                </div>
            </div>
            <div id="drawPageContainerMobile" class="d-lg-none">
                <div id='timerRoundAndWordMobile' hidden={!gameStarted} >
                    <div id='round'>Round: {currentRound.current}</div>
                    <div id='timer' hidden={!timeToDraw}>Time Left:&nbsp;&nbsp;{counter}</div>
                    <div id='hiddenWordMobile' hidden={showWordChoice && !turnToDraw}><pre dangerouslySetInnerHTML={{ __html: wordHidden.current }}></pre></div>
                </div>
                <div id='dataMobile' hidden={gameOver} >
                    <CanvasMobile />
                    <div id='guess' hidden={(hideGuessBox || turnToDraw) || !gameStarted}>
                        <form onSubmit={onSubmit} id='guessForm'>
                            <input className='form-control form-control-lg' id='guessBox' value={guessForm.guess} onChange={(e) => updateForm({ guess: e.target.value })} />
                            <input type='submit' className='btn btn-success' id='btnGuess' value='Guess' />
                        </form>
                    </div>
                    <div id='answer' hidden={(hideAnswer || turnToDraw) || !gameStarted}>
                        <div id='answerText'>Correct! it was: {wordToDraw}</div>
                    </div>
                    <div id='guess' hidden={gameStarted || gameOver || !gameOwner}>
                        <select className='form-select form-select-lg' id='rounds' onChange={(e) => setNumberOfRounds(e.target.value)} >
                            {options.map((option, index) => (
                                <option value={option.value} key={index}>{option.label}</option>
                            ))}
                        </select>
                        <input className='btn' id='btnGuess' value='Start Game' onClick={(e) => startGame(e)} />
                    </div>
                    <div id='showWordChoice' hidden={!showWordChoice}>
                        <div id='chooseWord'>
                            {wordsToChoose.map((data, index) => { return <input type='submit' className='btn' id='btnChooseWord' key={index} value={data} onClick={() => handleChoice(data)}></input>; })}
                        </div>
                        <div id='chooseWordText'>Choose a word!</div>
                        <div id='chooseWordTimer'>{counter}</div>
                    </div>
                    <div id='chosenWordText' hidden={showWordChoice || !turnToDraw || !gameStarted}>You are drawing: {wordToDraw}</div>
                    <div id='colorsHide' hidden={!turnToDraw || !gameStarted}>
                        <ColoursMobile />
                    </div>


                </div>
                <Table />
            </div>
        </div>
    );
}