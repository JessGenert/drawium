import React, { useEffect, useRef, useContext, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SocketContext } from "../utilities/sockets";
import { brushSize, color } from "./toolsAndColors";

let ctx;
let canvas;

export function getCanvasBlob() {
    return new Promise(function (resolve, reject) {
        if (canvas) {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, "image/jpeg")
        }
    })

}

export default function Canvas() {

    const canvasRef = useRef(null);
    const socket = useContext(SocketContext);
    const [searchParams,] = useSearchParams();
    const gameID = searchParams.get('gameId');
    let lineCap = 'round';
    let drawing = false;
    let current = {};



    useEffect(() => {
        socket.on('toolP', toolPencil);
        return () => { socket.off('toolP'); }
    })



    useEffect(() => {
        socket.on("clear", (newTurn) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (newTurn) {
                canvas.removeEventListener('mousedown', onMouseDown, false);
                canvas.removeEventListener('mouseup', onMouseUp, false);
                canvas.removeEventListener('mouseout', onMouseUp, false);
                canvas.removeEventListener('mousemove', throttle(onMouseMove, 25), false);
            }

        });
        return () => { socket.off('clear'); }
    })



    function toolPencil() {
        if (canvas) {
            canvas.addEventListener('mousedown', onMouseDown, false);
            canvas.addEventListener('mouseup', onMouseUp, false);
            canvas.addEventListener('mouseout', onMouseUp, false);
            canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
        }
    }


    function drawLine(x0, y0, x1, y1, color, brushSize, lineCap, emit) {
        let rect = canvas.getBoundingClientRect();
        if (rect.left, rect.right, rect.top, rect.bottom) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = lineCap;
            ctx.stroke();
            ctx.closePath();
        }
        if (!emit) { return; }

        let drawingData = {
            x0: x0,
            y0: y0,
            x1: x1,
            y1: y1,
            color: color,
            brushSize: brushSize,
            lineCap: lineCap
        };


        let w = canvas.width;
        let h = canvas.height;
        let drawingDataMobile = {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color,
            brushSize: brushSize,
            lineCap: lineCap
        };

        socket.emit('drawing', drawingData, gameID);
        socket.emit('drawingMobile', drawingDataMobile, gameID);
    }

    const onMouseDown = useCallback((e) => {
        drawing = true;
        let rect = canvas.getBoundingClientRect();
        current.x = e.clientX - rect.left;
        current.y = e.clientY - rect.top;
    }, [])

    const onMouseUp = useCallback((e) => {
        if (!drawing) { return; }
        drawing = false;
        let rect = canvas.getBoundingClientRect();
        drawLine(current.x, current.y, e.clientX - rect.left, e.clientY - rect.top, color, brushSize, lineCap, true);
    }, [])

    const onMouseMove = useCallback((e) => {
        if (!drawing) { return; }
        let rect = canvas.getBoundingClientRect();
        drawLine(current.x, current.y, e.clientX - rect.left, e.clientY - rect.top, color, brushSize, lineCap, true);
        current.x = e.clientX - rect.left;
        current.y = e.clientY - rect.top;
    }, [])

    const throttle = useCallback((callback, delay) => {
        var previousCall = new Date().getTime();
        return function () {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }, [])

    useEffect(() => {
        socket.on('drawing', onDrawingEvent);
        return () => { socket.off('drawing') }
    })

    function onDrawingEvent(data) {

        drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.brushSize, data.lineCap);
    }


    const getCanvas = async (canvas) => {

        ctx = canvas.current.getContext('2d');
    };


    useEffect(() => {
        getCanvas(canvasRef);
        canvas = document.getElementById("canvas");
    });


    return (
        <canvas ref={canvasRef} id="canvas" width={600} height={600} />
    );
}