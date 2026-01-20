// NOTE: Ensure codes.js is loaded BEFORE this file in index.html

const BASE_URL = "https://api.currencyapi.com/v3/latest?apikey=cur_live_kRqRAM85HmPrwukbznry6INCClu252vFyeHVJc7H";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const swapIcon = document.querySelector("#swap-icon"); // Select the icon

// 1. Populate Dropdowns
for (let select of dropdowns) {
  for (currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;

    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
    } else if (select.name === "to" && currCode === "INR") {
      newOption.selected = "selected";
    }
    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

// 2. Update Flag Image
const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode]; 
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

// 3. Exchange Rate Logic
const updateExchangeRate = async () => {
  let amount = document.querySelector(".amount-box input");
  let amtVal = amount.value;
  
  if (amtVal === "" || amtVal < 1) {
    amtVal = 1;
    amount.value = "1";
  }

  msg.innerText = "Getting exchange rate...";

  try {
      const URL = `${BASE_URL}&base_currency=${fromCurr.value}&currencies=${toCurr.value}`;
      let response = await fetch(URL);
      let data = await response.json();
      
      let rate = data.data[toCurr.value].value;
      
      let finalAmount = (amtVal * rate).toFixed(2);
      msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
  } catch (error) {
      msg.innerText = "Error fetching rates.";
      console.error(error);
  }
};

// 4. NEW: Flip (Swap) Button Logic
swapIcon.addEventListener("click", () => {
    // Swap the values
    let tempCode = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = tempCode;

    // Update the flags to match new values
    updateFlag(fromCurr);
    updateFlag(toCurr);

    // Recalculate the rate
    updateExchangeRate();
});

// 5. Button Click
btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

// Run on load
window.addEventListener("load", () => {
  updateExchangeRate();
});