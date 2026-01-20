const insert = document.getElementById('insert');

window.addEventListener('keydown', (e) => {
    // Prevent default browser actions for some keys (like F5 or Space scrolling) if you want strict checking
    // e.preventDefault(); 
    
    insert.innerHTML = `
    <div class='color'>
        <table>
            <tr>
                <th>Key Name</th>
                <th>Key Code</th>
                <th>Code</th>
            </tr>
            <tr>
                <td>${e.key === " " ? "Space" : e.key}</td>
                <td>${e.keyCode}</td> 
                <td>${e.code}</td>
            </tr>
        </table>
    </div>
    `;
});