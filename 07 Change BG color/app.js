const startbtn=document.querySelector("#start");
const stopbtn=document.querySelector("#stop");

//generate random color
const randomColor = function(){
    const hexval="0123456789ABCDEF";
    let color='#';
    for(let i=0;i<6;i++){
        color+=hexval[Math.floor(Math.random() *16)];   //this chooses value from 0-16 Math.floor(Math.random() *16);    
    }
    return color;
};

let intervalId
const startcolorchange =  function(){
    if(!intervalId){
        intervalId=setInterval(changebgcolor,1000);
    }
    
    function changebgcolor(){
        document.body.style.backgroundColor=randomColor();
    };   
};

const stopcolorchange=function(){
    clearInterval(intervalId);
    intervalId=null;
};

startbtn.addEventListener('click',startcolorchange);
stopbtn.addEventListener('click',stopcolorchange);