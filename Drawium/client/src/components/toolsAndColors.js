import React, { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { SocketContext } from "../utilities/sockets";
import brushImg from "../images/brush.svg";
import clear from "../images/clear.svg";
export let brushSize = 5;
export let color = "rgb(0,0,0)";

export default function Colours() {

    const socket = useContext(SocketContext);
    const [searchParams,] = useSearchParams();
    const gameID = searchParams.get('gameId');


    function updateColor(value) {
        color = value;
    }

    function updateSize(value) {
        brushSize = value;
    }

    function updateClear(e) {
        e.preventDefault();
        socket.emit("clear", gameID);
    }

    return (
        <div id="buttonGroup" class="d-none d-xs-none d-sm-none d-md-block">
            <div className="container" role="group" id="btnContainer">
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(100, 30, 22)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(74, 35, 90)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(27, 79, 114)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(20, 90, 50)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(183, 149, 11)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(110, 44, 0)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(0, 0, 0)" }} value={color} />
            </div>
            <div className="container" role="group" id="btnContainer">
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(192, 57, 43)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(142, 68, 173)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(46, 134, 193)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(40, 180, 99)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(241, 196, 15)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(211, 84, 0)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(113, 125, 126)" }} value={color} />
            </div>
            <div className="container" role="group" id="btnContainer">
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(245, 183, 177)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(210, 180, 222)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(214, 234, 248)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(171, 235, 198)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(252, 243, 207)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(229, 152, 102)" }} value={color} />
                <button type="button" className="btn" id="btnColor" onClick={(e) => updateColor(e.target.style.backgroundColor)} style={{ backgroundColor: "rgb(253, 254, 254)" }} value={color} />
            </div>
            <div className="container" id="btnContainer">
                <button type="button" className="btn" id="tool" onClick={(e) => updateSize(5)}><img src={brushImg} id="brush" height={15} width={15} alt="size 15" /></button>
                <button type="button" className="btn" id="tool" onClick={(e) => updateSize(15)}><img src={brushImg} id="brush" height={25} width={25} alt="size 25" /></button>
                <button type="button" className="btn" id="tool" onClick={(e) => updateSize(35)}><img src={brushImg} id="brush" height={35} width={35} alt="size 35" /></button>
                <button type="button" className="btn" id="tool" height={75} width={75}></button>
                <button type="button" className="btn" id="tool" height={75} width={75}></button>
                <button type="button" className="btn" id="tool" height={75} width={75}></button>
                <button type="button" className="btn" id="tool" onClick={(e) => updateClear(e)}><img src={clear} id="clear" height={75} width={75} alt="clear" /></button>
            </div>
        </div>



    );
}