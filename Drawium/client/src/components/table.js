import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { socket } from "../utilities/sockets";
import axios from "axios";

//awful hack to stop player scores from updating twice
//originally it was 4 times, it has to do with how the socket works I am pretty sure
let playersToUpdate = [];
export const savePlayers = async () => {
  playersToUpdate.splice(playersToUpdate.length/2)
  await axios.put('/api/updatePlayerScores/', playersToUpdate);
  }

export default function Table() {

  const [searchParams,] = useSearchParams();
  const gameID = searchParams.get('gameId');
  const theadData = ["Avatar", "Name", "Score"];
  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [playerTable, setPlayerTable] = useState([])
  const thePlayers = useRef([]);
  
 

  useEffect(() => {
    socket.on('updatePlayerTable', async (players) => {
      setPlayerTable(players);
      thePlayers.current = players;
      socket.emit('updateGameOwner', gameID, players);
    });
    return () => { socket.off('updatePlayerTable'); };
  }, []);

  useEffect(() => {
    socket.on('scores', (data) => { setScores(prevState => prevState, scores[data.index] = data.score); });
    return () => { socket.off('scores'); };
  }, []);


  useEffect(() => {
    socket.on('saveScores', () => { 
      
        const max = Math.max(...scores);
        const index = scores.indexOf(max);
      

        thePlayers.current.forEach((el, i) => {
          playersToUpdate.push({
            userid: el.userid,
            totalscore: scores[i],
            gameswon: i === index ? 1 : 0,
            gamesplayed: 1
          });
        });
    })
   
    return () => { socket.off('saveScores'); };
  }, []);






  





return (
  <div id='table'>
    <table className="table table-dark table-striped" id="table">
      <thead>
        <tr>
          {theadData.map((data, index) => { return <th key={index}> {data}</th>; })}
        </tr>
      </thead>
      <tbody>
        {playerTable.map((player, index) => { return (<tr key={index}><td><img src={player.avatar} alt="player avatar" id="avatar"></img></td><td>{player.username}</td><td>{scores[index]}</td></tr>); })}
      </tbody>
    </table>
  </div>
);
}