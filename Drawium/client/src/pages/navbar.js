import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import pencil from "../images/pencil.png";
import SecureLS from 'secure-ls'
export let userInfo = {};
let params = new URLSearchParams(document.location.search);
let code = params.get('code');
let guest = params.get('guestLogin')
const ls = new SecureLS({ encodingType: 'aes' })

if (code !== null) {
  axios.get('/api/login', { params: { code: code } })
    .then(function (response) {
      ls.set('user', response.data);
      window.location.href = '/lobby'
    })
}
if (guest !== null) {
  axios.get('/api/login', { params: { code: '' } })
    .then(function (response) {
      ls.set('user', response.data);
      window.location.href = '/lobby'
    })
}



export default function Navbar() {

  const [avatar, setAvatar] = useState('');
  const [username, setUsername] = useState('');
  const [searchParams,] = useSearchParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isGame, setIsGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isProfile, setIsProfile] = useState(false);
  const [leaveGame, setLeaveGame] = useState(false);
  const location = useLocation();




  useEffect(() => {
    getProfile();

    if (location.pathname === '/') {
      setLoggedIn(false);
    } else {
      setLoggedIn(true);
    }

  }, []);


  useEffect(() => {

    setTimeout(() => {
      if (!userInfo.username && (location.pathname === '/lobby' || location.pathname === '/profile' || location.pathname === '/draw')) {
        window.location.href = '/';
      } else if (userInfo.username && location.pathname === '/') {
        window.location.href = '/lobby';
      }
    }, 1000);


    if (location.pathname === '/draw') {
      setIsGame(true);
    }

    if (location.pathname === '/profile') {
      setIsProfile(true);
    }
    if (searchParams.get('started')) {
      setGameStarted(true);
    }

    if (searchParams.get('gameStatus')) {
      setLeaveGame(true);
    }
  });



  function profile() {
    window.location.href = '/profile';
  }

  function lobby() {
    window.location.href = '/lobby';
  }


  function getProfile() {
    userInfo = ls.get('user')
    setAvatar(userInfo.avatar);
    setUsername(userInfo.username);
  };

  //TODO: deal with the redirects using a cookie so that
  // if they are not logged in, they can still join after loggin in
  function copyInvite(e) {
    e.preventDefault();
    let link = 'https://www.drawium.lol/invite?game=';
    let gameId = searchParams.get('gameId');
    link = link + gameId;
    navigator.clipboard.writeText(link);
  }

  async function logout(e) {
    e.preventDefault();
    ls.removeAll();
    window.location.href = "/";
  }


  //#region handle leaving the game
  async function leaveTheGame(e) {
    e.preventDefault();
    setLeaveGame(false);
    window.location.href = '/lobby';
  }
  //#endregion


  return (
    <div hidden={!loggedIn}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <img src={pencil} alt="pencil.png" id="pencil" onClick={lobby} style={{ cursor: 'pointer' }}></img>
        <div>
          <form id='guessForm'>
            <input type='submit' className='btn' id='btnInvite' value='Copy Invite Link' hidden={!isGame || gameStarted} onClick={(e) => copyInvite(e)} />
          </form>
          <form id='guessForm'>
            <input type='submit' className='btn' id='btnInvite' value='Logout' hidden={isGame || !isProfile} onClick={(e) => logout(e)} />
          </form>
          <form id='guessForm'>
            <input type='submit' className='btn' id='btnInvite' value='Leave Game' hidden={!leaveGame} onClick={(e) => leaveTheGame(e)} />
          </form>

        </div>
        <div hidden={!loggedIn} id='profile'>
          <div className='profileName d-none d-sm-none d-xs-none d-md-block'>
            {username}
          </div>
          <div className='profileAvatar'>
            <img src={avatar} alt='' id='avatarNav' onClick={profile} style={{ cursor: 'pointer' }}></img>
          </div>
        </div>
      </nav>
    </div>
  );
}