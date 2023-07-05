import React, { useState } from "react";
import { userInfo } from "../pages/navbar";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useRequest } from '../utilities/useRequest';



export default function Mainpage() {

  const [currentPlayers, setCurrentPlayers] = useState('');
  const [form, setForm] = useState({ name: '' });
  const { data: currentGames, error } = useRequest('/api/games');


  function changeForm() {
    setForm({ name: '' });
  }


  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });

  }

  function updatePlayersList(value) {
    let players = value.players;
    return setCurrentPlayers(players.map((data) => data.username).join('\n'));
  }


  async function createGame(e) {
    e.preventDefault();
    let playersInGame = [];
    const newGameName = { ...form };

    try {
      let existingGame = currentGames.filter(function (data) { return data.name === newGameName.name.trim(); });
      if (existingGame[0].name === newGameName.name.trim()) {
        window.alert('Game name already taken!');
        setForm({ name: '' });
        return;
      }
    } catch { }


    if (newGameName.name.trim().length === 0 || newGameName.name.length === 0 || newGameName.name.length > 21) {
      window.alert('Invalid game name!');
      setForm({ name: '' });
      return;
    }


    let currentPlayer = { username: userInfo.username, userid: userInfo._id, avatar: userInfo.avatar, score: 0 };
    playersInGame.push(currentPlayer);
    let newGame = {
      _id: uuidv4(),
      name: newGameName.name.trim(),
      players: playersInGame,
      started: false
    };
    await axios.post('/api/game', newGame);
    joinGame(newGame._id);

  }


  async function addPlayerToGame(e) {
    e.preventDefault();

    if (form.name === '') { window.alert('Please select a game'); return; }

    let selectedGame = currentGames.filter(function (data) { return data.name === form.name; });
    let currentPlayer = { username: userInfo.username, userid: userInfo._id, avatar: userInfo.avatar, score: 0 };

    let isPlayerInGame = selectedGame[0].players.filter(function (player) { return player.userid === currentPlayer.userid; });
    if (isPlayerInGame[0]) {
      joinGame(selectedGame[0]._id);
    } else {

      await axios.put(`/api/updatePlayers/${selectedGame[0]._id}`, { players: currentPlayer });
      joinGame(selectedGame[0]._id);
    }
  }


  function joinGame(game) {
    if (game.started === true) {
      return setForm({ name: '' });
    } else {
      window.location.href = `/draw?gameId=${game}&started=false&status=true`;
    }
  }

  if (error) return <h1>Something went wrong!</h1>;
  if (!currentGames) return <h1>Loading...</h1>;

  return (
    <div className=''>
      <div id='Jumbotron' class="d-none d-xs-none d-sm-none d-md-flex">
        <div className='container-fluid py-5'>
          <div id='mainPage'>
            <p id='appName'>Drawium</p>
            <div id='gameAndPlayers'>
              <select className='form-select' size='6' id='result'>
                {currentGames.map((game) => (
                  <option key={game._id} hidden={game.started} onClick={(e) => { updateForm({ name: e.target.value }); updatePlayersList(currentGames.filter(function (data) { return data.name === e.target.value; })[0]); }}>{game.name}</option>
                ))}
              </select>
              <textarea className='form-control' id='playersInGame' rows='8' disabled={true} value={currentPlayers}>
              </textarea>
            </div>
            <form>
              <input className='form-control' type='text' id='form' value={form.name} onFocus={changeForm} onChange={(e) => updateForm({ name: e.target.value })}></input>

            </form >
            <div id='gameButtons'>
              <input className='btn btn-md fw-bold' id='createGame' type='submit' value='Create Game' onClick={createGame} />
              <input className='btn btn-md fw-bold' type='submit' id='joinGame' value='Join Game' onClick={addPlayerToGame} />
            </div>
          </div>
        </div>
      </div>
      <div className='container-fluid py-5' class="d-md-none">
        <div id='mainPage'>
          <p id='appName'>Drawium</p>
          <div id='gameAndPlayers'>
            <select className='form-select' class='form-select' id='resultMobile'>
              {currentGames.map((game) => (
                <option key={game._id} hidden={game.started} onSelect={(e) => { updateForm({ name: e.target.value }); updatePlayersList(currentGames.filter(function (data) { return data.name === e.target.value; })[0]); }}>{game.name}</option>
              ))}
            </select>
            <textarea className='form-control' id='playersInGameMobile' rows='8' disabled={true} value={currentPlayers}>
            </textarea>
          </div>
          <form>
            <input className='form-control' type='text' id='form' value={form.name} onChange={(e) => updateForm({ name: e.target.value })}></input>

          </form >
          <div id='gameButtons'>
            <input className='btn btn-md fw-bold' id='createGame' type='submit' value='Create Game' onClick={createGame} />
            <input className='btn btn-md fw-bold' type='submit' id='joinGame' value='Join Game' onClick={addPlayerToGame} />
          </div>
        </div>
      </div>
    </div>
  );
}