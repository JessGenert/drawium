import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profilepage() {

  const [users, setUsers] = useState([])
  const [playerTable, setPlayerTable] = useState([])
  const [user, setUser] = useState([])
  const [userDrawings, setUserDrawings] = useState([])
  const [hideProfile, setHideProfile] = useState(true)
  const [showDrawings, setShowDrawings] = useState(false)
  // leaving drawing in there so I can add search functionality for drawings later on
  const [form, setForm] = useState({
    profile: '',
    drawing: ''
  });


  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }


  useEffect(() => {
    const getPlayers = async () => {
      const response = await axios.get('/api/players')
      setUsers(response.data)
    }
    getPlayers();
  }, [])

  const showPlayerDrawings = async () => {
    setHideProfile(true)
    setShowDrawings(true)
  }


  const windowOpen = (e, val) => {
    e.preventDefault();
    window.open(`https://drawium.s3.us-west-2.amazonaws.com/${val.url}`);
  }

  function handleChange(e) {
    setShowDrawings(false)
    setHideProfile(true)
    setPlayerTable(users.filter(el => { let { username } = el; if (e.target.value.length) return username.startsWith(e.target.value) }));
  }


  async function handleClick(e) {
    e.preventDefault()
    let player = users.filter(el => { return el.username.toString() === e.target.innerHTML.toString() });
    setUser(player[0]);
    setUserDrawings(player[0].drawings)
    setPlayerTable([]);
    setHideProfile(false)
    setForm({ profile: '' });
  }


  return (
    <div>
      <div>
        <form id='profileForm' class="d-none d-xs-none d-sm-none d-md-flex" >
          <input className='form-control form-control-lg' id='profileSearch' placeholder='Search Profiles...' value={form.profile} onChange={(e) => updateForm({ profile: e.target.value, drawing: '' })} onChangeCapture={(e) => handleChange(e)} />
        </form>
      </div>
      <div class="d-md-none" >
        <form id='profileForm'>
          <input className='form-control form-control-lg' id='profileSearchMobile' placeholder='Search Profiles...' value={form.profile} onChange={(e) => updateForm({ profile: e.target.value, drawing: '' })} onChangeCapture={(e) => handleChange(e)} />
        </form>
      </div>
      <div>
        <table className='table table-dark table-striped' id='tableProfile'>
          <tbody>
            {playerTable.map((val, index) => (
              <tr key={index}><td onClick={(e) => handleClick(e)}>{val.username}</td></tr>
            )
            )}
          </tbody>
        </table>
      </div>

      <div id='profileUser' hidden={hideProfile}>
        <div class='card'>
          <img src={user.avatar + '?size=512'} class='card-img-top' alt=' ' />
          <div class='card-body'>
            <h5 class='card-title'>{user.username}'s Profile</h5>
          </div>
          <ul class='list-group list-group-flush'>
            <li class='list-group-item'>Games Played: {user.gamesplayed}</li>
            <li class='list-group-item'>Games Won: {user.gameswon}</li>
            <li class='list-group-item'>Total Score: {user.totalscore}</li>
            <li class='list-group-item' onClick={showPlayerDrawings} style={{ cursor: 'pointer', color: 'blue' }} >Drawing Gallery</li>
          </ul>
        </div>
      </div>

      <div>
        <div id='divDrawings' hidden={!showDrawings}>
          {userDrawings.map((val, index) => (

            <div key={index} id='indexDrawings'>
              <p id='drawingName'>{val.word}</p>

              <img src={`https://drawium.s3.us-west-2.amazonaws.com/${val.url}`} width={100} height={100} id='drawing' onClick={(e) => windowOpen(e, val)} style={{ cursor: 'pointer' }}></img>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}