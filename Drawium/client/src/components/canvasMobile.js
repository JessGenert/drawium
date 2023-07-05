import React, { useEffect, useRef, useContext } from "react";
import { brushSize, color } from "./toolsAndColorsMobile";
import { useSearchParams } from "react-router-dom";
import { SocketContext } from "../utilities/sockets";
let ctxMobile;
let canvasMobile;
export default function CanvasMobile() {

    const canvasRefMobile = useRef(null);
    const socket = useContext(SocketContext);
    const [searchParams,] = useSearchParams();
    const params = searchParams.get('gameId');
    let lineCap = 'round';
    let drawing = false;
    let current = {};


    useEffect(() => {
        socket.on('toolP', toolPencil);
        return () => { socket.off('toolP'); }
    })

    socket.on("clear", (newTurn) => {
        ctxMobile.clearRect(0, 0, canvasMobile.width, canvasMobile.height);
        ctxMobile.fillStyle = "white";
        ctxMobile.fillRect(0, 0, canvasMobile.width, canvasMobile.height);
        if (newTurn) {
            canvasMobile.removeEventListener('pointerdown', onMouseDown, false);
            canvasMobile.removeEventListener('pointerup', onMouseUp, false);
            canvasMobile.removeEventListener('pointerout', onMouseUp, false);
            canvasMobile.removeEventListener('pointermove', throttle(onMouseMove, 25), false);
        }

        return () => { socket.off('clear'); }

    });

    function toolPencil() {
        if (canvasMobile) {
            canvasMobile.addEventListener('pointerdown', onMouseDown, false);
            canvasMobile.addEventListener('pointerup', onMouseUp, false);
            canvasMobile.addEventListener('pointerout', onMouseUp, false);
            canvasMobile.addEventListener('pointermove', throttle(onMouseMove, 10), false);
        }
    }



    function drawLine(x0, y0, x1, y1, color, brushSize, lineCap, emit) {
        let rect = canvasMobile.getBoundingClientRect();
        if (rect.left, rect.right, rect.top, rect.bottom) {
            ctxMobile.beginPath();
            ctxMobile.moveTo(x0, y0);
            ctxMobile.lineTo(x1, y1);
            ctxMobile.strokeStyle = color;
            ctxMobile.lineWidth = brushSize;
            ctxMobile.lineCap = lineCap;
            ctxMobile.stroke();
            ctxMobile.closePath();
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

        let w = rect.right;
        let h = rect.bottom;
        let drawingDataMobile = {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color,
            brushSize: brushSize,
            lineCap: lineCap
        };

        socket.emit('drawing', drawingData, params);
        socket.emit('drawingMobile', drawingDataMobile, params);

    }

    function onMouseDown(e) {
        drawing = true;
        let rect = canvasMobile.getBoundingClientRect();
        current.x = e.clientX * (600 / rect.right);
        current.y = (e.clientY - rect.top) * 1.6;
    }

    function onMouseUp(e) {
        if (!drawing) { return; }
        drawing = false;
        let rect = canvasMobile.getBoundingClientRect();
        drawLine(current.x, current.y, e.clientX * (600 / rect.right), (e.clientY - rect.top) * 1.6, color, brushSize, lineCap, true);
        // saveCanvas()

    }

    function onMouseMove(e) {
        if (!drawing) { return; }
        let rect = canvasMobile.getBoundingClientRect();
        drawLine(current.x, current.y, e.clientX * (600 / rect.right), (e.clientY - rect.top) * 1.6, color, brushSize, lineCap, true);
        current.x = e.clientX * (600 / rect.right);
        current.y = (e.clientY - rect.top) * 1.6;
    }

    function throttle(callback, delay) {
        let previousCall = new Date().getTime();
        return function () {
            let time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }


    useEffect(() => {
        socket.on('drawingMobile', onDrawingEvent);
        return () => { socket.off('drawingMobile') }
    })




    function onDrawingEvent(data) {
        let rect = canvasMobile.getBoundingClientRect();
        let w = rect.right;
        let h = rect.bottom;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.brushSize, data.lineCap);
    }


    const getCanvasMobile = async (canvas) => {

        ctxMobile = canvas.current.getContext('2d');
        ctxMobile.clearRect(0, 0, canvas.width, canvas.height);
        ctxMobile.fillStyle = "white";
        ctxMobile.fillRect(0, 0, canvas.width, canvas.height);

    };

    useEffect(() => {
        getCanvasMobile(canvasRefMobile);
        canvasMobile = document.getElementById("canvasMobile");
    }, []);


    return (
        <canvas ref={canvasRefMobile} id="canvasMobile" width={600} height={600} />
    );
}