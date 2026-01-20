/*
winning patterns: 8 patterns total
*/

let boxes = document.querySelectorAll(".box");
let resetbtn = document.querySelector("#reset-btn");
let newbtn = document.querySelector("#new-btn");
let msgcontainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");

// alternate turns
let turn0 = true; // true = Player O, false = Player X
let clicks = 0;   // track draw

const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

const resetGame = () => {
    turn0 = true;
    clicks = 0;
    enableboxes();
    msgcontainer.classList.add("hide");
};

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if(turn0){
            // Player O
            box.style.color = "#ff4081"; // Neon Pink
            box.innerText = "O";
            turn0 = false;
        } else {
            // Player X
            box.style.color = "#22d3ee"; // Neon Cyan
            box.innerText = "X";
            turn0 = true;
        } 
        box.disabled = true;
        clicks++;
        
        let isWinner = checkWinner();
        
        if(clicks === 9 && !isWinner){
            gameDraw();
        }
    });
});

const gameDraw = () => {
    msg.innerText = `It's a Draw!`;
    msgcontainer.classList.remove("hide");
    disableboxes();
};

const disableboxes = () => {
    for(let box of boxes){
        box.disabled = true;
    }
};

const enableboxes = () => {
    for(let box of boxes){
        box.disabled = false;
        box.innerText = "";
    }
};

const showWinner = (winner) => {
    msg.innerText = `Winner: ${winner}`;
    msgcontainer.classList.remove("hide");
    disableboxes();
};

const checkWinner = () => {
    for(let pattern of winPatterns){
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;

        if(pos1val != "" && pos2val != "" && pos3val != ""){
            if(pos1val === pos2val && pos2val === pos3val){
                showWinner(pos1val);
                return true;
            }
        }
    }
    return false;
};

newbtn.addEventListener("click", resetGame);
resetbtn.addEventListener("click", resetGame);