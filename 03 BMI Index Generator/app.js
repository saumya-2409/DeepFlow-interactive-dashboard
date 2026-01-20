const form = document.querySelector('form');
const results = document.querySelector("#results");

form.addEventListener('submit', function(e){
    e.preventDefault();

    const height = parseInt(document.querySelector("#height").value);
    const weight = parseInt(document.querySelector("#weight").value);

    // Validate Input
    if(height === '' || height < 0 || isNaN(height)){
        results.innerHTML = `<span style="color:#ef4444;">Please give a valid height</span>`;
    } 
    else if(weight === '' || weight < 0 || isNaN(weight)){
        results.innerHTML = `<span style="color:#ef4444;">Please give a valid weight</span>`;
    } 
    else {
        // Calculate BMI
        const bmi = (weight / ((height * height) / 10000)).toFixed(2);
        
        let message = '';
        let colorClass = '';

        // Determine Health Category
        if (bmi < 18.6) {
            message = "Underweight";
            colorClass = "underweight";
        } else if (bmi >= 18.6 && bmi < 24.9) {
            message = "Normal Range";
            colorClass = "normal";
        } else if (bmi >= 24.9 && bmi < 30) {
            message = "Overweight";
            colorClass = "overweight";
        } else {
            message = "Obese";
            colorClass = "obese";
        }

        // Display Result with Dynamic Color
        results.innerHTML = `
            <div class="bmi-value ${colorClass}">${bmi}</div>
            <div class="bmi-msg ${colorClass}">${message}</div>
        `;
        
        // Remove dashed border for cleaner look once result is shown
        results.style.border = "1px solid transparent";
    }
});