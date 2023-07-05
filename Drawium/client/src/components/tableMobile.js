import React, {useState, useEffect} from "react";
import { useSearchParams } from "react-router-dom";
import { socket } from "../utilities/sockets";

export default function TableMobile(){

  
 
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
    return () => {
      socket.off('scores');
    };
  });
  
    return(
        <div id='table' class="d-xs-block d-sm-block d-md-none flex-column">
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