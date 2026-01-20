/* =================================================================
   DASHBOARD CONTROLLER
   Modular structure for better maintainability.
   ================================================================= */

const Dashboard = {
    // Shared Utilities to reduce code duplication
    Utils: {
        $: (id) => document.getElementById(id),
        selectAll: (selector) => document.querySelectorAll(selector),
        randomInt: (max) => Math.floor(Math.random() * max),
        randomColor: () => {
            const hex = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) color += hex[Math.floor(Math.random() * 16)];
            return color;
        },
        toast: (msg, type = 'default') => {
            const div = document.createElement('div');
            div.className = `toast ${type}`;
            div.innerText = msg;
            document.body.appendChild(div);
            
            // Remove after 3 seconds
            setTimeout(() => {
                div.style.opacity = '0';
                div.style.transition = 'opacity 0.5s';
                setTimeout(() => div.remove(), 500);
            }, 3000);
        } 
    },

    init: function() {
        this.Theme.init();
        this.Tabs.init();      // <--- ADD THIS
        this.Calculator.init();// <--- ADD THIS
        this.Clock.init();
        this.ColorWidget.init();
        this.Keyboard.init();
        this.Simon.init();
        this.Todo.init();
        this.RPS.init();
        this.TTT.init();
        this.Guess.init();
        this.BMI.init();
        this.Currency.init();
        this.Timer.init();
        console.log("Dashboard initialized successfully.");
    },

    // 1. Clock Module
    Clock: {
        init: function() {
            const el = Dashboard.Utils.$('clockDisplay');
            if (!el) return;
            const update = () => el.innerText = new Date().toLocaleTimeString();
            update();
            setInterval(update, 1000);
        }
    },

    // 2. Color Widget Module
    ColorWidget: {
        init: function() {
            const startBtn = Dashboard.Utils.$('startBtn');
            const stopBtn = Dashboard.Utils.$('stopBtn');
            const card = Dashboard.Utils.$('colorWidget');
            let intervalId = null;

            if (!startBtn || !card) return;

            startBtn.addEventListener('click', () => {
                if (!intervalId) {
                    intervalId = setInterval(() => {
                        card.style.backgroundColor = Dashboard.Utils.randomColor();
                        card.style.color = "#fff";
                        card.style.borderColor = "#fff";
                    }, 1000);
                }
            });

            stopBtn.addEventListener('click', () => {
                clearInterval(intervalId);
                intervalId = null;
                card.style.backgroundColor = "";
                card.style.color = "";
                card.style.borderColor = "";
            });
        }
    },

    // 3. Keyboard Checker
    Keyboard: {
        init: function() {
            const display = Dashboard.Utils.$('keyDisplay'); // Implicitly checking usage via try/catch not needed, simply check existence
            const widget = Dashboard.Utils.$('keyboardWidget');
            if (!widget) return; // Only run if widget exists (it's a static link now in HTML, but logic kept if user adds it back)

            // Note: In current HTML, this is just a link, but logic is preserved for future widget use
            window.addEventListener('keydown', (e) => {
                if(display) display.innerHTML = `<span style="font-size:2rem; font-weight:bold; color:#fff;">${e.key === " " ? "Space" : e.key}</span>`;
            });
        }
    },

    // 4. Simon Says Module
    Simon: {
        gameSeq: [],
        userSeq: [],
        started: false,
        level: 0,
        btns: ["simon-green", "simon-red", "simon-yellow", "simon-purple"],

        init: function() {
            const startBtn = Dashboard.Utils.$("simon-start-btn");
            const statusText = Dashboard.Utils.$("simon-status");
            const self = this; 

            if (!startBtn) return;

            startBtn.addEventListener("click", () => {
                if (!self.started) {
                    self.started = true;
                    self.level = 0;
                    self.gameSeq = [];
                    self.userSeq = [];
                    startBtn.style.display = 'none';
                    self.levelUp(statusText);
                }
            });

            Dashboard.Utils.selectAll(".simon-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    if (!self.started) return;
                    self.flash(this, 100);
                    self.userSeq.push(this.id);
                    self.checkAns(self.userSeq.length - 1, statusText, startBtn);
                });
            });
        },

        flash: function(btn, ms) {
            btn.classList.add("flash-active");
            setTimeout(() => btn.classList.remove("flash-active"), ms);
        },

        levelUp: function(statusText) {
            this.userSeq = [];
            this.level++;
            statusText.innerText = `Level ${this.level}`;
            
            const randIdx = Dashboard.Utils.randomInt(4);
            const randColor = this.btns[randIdx];
            this.gameSeq.push(randColor);

            let i = 0;
            const interval = setInterval(() => {
                const btn = Dashboard.Utils.$(this.gameSeq[i]);
                if(btn) this.flash(btn, 250);
                i++;
                if (i >= this.gameSeq.length) clearInterval(interval);
            }, 600);
        },

        checkAns: function(idx, statusText, startBtn) {
            if (this.userSeq[idx] === this.gameSeq[idx]) {
                if (this.userSeq.length === this.gameSeq.length) {
                    setTimeout(() => this.levelUp(statusText), 1000);
                }
            } else {
                statusText.innerHTML = `<span style="color:#ef4444">Game Over!</span>`;
                setTimeout(() => {
                    statusText.innerText = `Score: ${this.level}`;
                    startBtn.innerText = "RETRY";
                    startBtn.style.display = "block";
                    this.started = false;
                }, 1500);
            }
        }
    },

    // 5. To-Do List Module (Updated with Empty State)
    
    Todo: {
        init: function() {
            const input = Dashboard.Utils.$('todo-input');
            const addBtn = Dashboard.Utils.$('todo-add');
            const list = Dashboard.Utils.$('todo-list');
            const clearDone = Dashboard.Utils.$('todo-clear-completed');
            const clearAll = Dashboard.Utils.$('todo-clear-all');

            if (!input || !list) return;

            this.load(list);

            addBtn.addEventListener('click', () => this.add(input, list));
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.add(input, list); });
            
            if(clearDone) clearDone.addEventListener('click', () => this.clear(list, false));
            if(clearAll) clearAll.addEventListener('click', () => this.clear(list, true));
        },

        // NEW: Helper to toggle empty message
        checkEmpty: function(list) {
            const emptyMsg = document.getElementById('todo-empty');
            if (!emptyMsg) return;
            
            if (list.children.length === 0) {
                emptyMsg.style.display = 'block';
            } else {
                emptyMsg.style.display = 'none';
            }
        },

        load: function(list) {
            const saved = localStorage.getItem('dashboardWidgetTodo');
            if (saved) {
                JSON.parse(saved).reverse().forEach(t => this.createEl(t.text, t.completed, list));
            }
            this.checkEmpty(list); // Check on load
        },

        save: function(list) {
            const tasks = [];
            list.querySelectorAll('.todo-item').forEach(item => {
                tasks.push({
                    text: item.querySelector('span').innerText,
                    completed: item.querySelector('input').checked
                });
            });
            localStorage.setItem('dashboardWidgetTodo', JSON.stringify(tasks));
            this.checkEmpty(list); // Check on save
        },

        createEl: function(text, completed, list) {
            const li = document.createElement('li');
            li.className = completed ? 'todo-item completed' : 'todo-item';
            li.innerHTML = `<input type="checkbox" ${completed ? 'checked' : ''}><span>${text}</span>`;
            
            const checkbox = li.querySelector('input');
            const span = li.querySelector('span');
            
            const toggle = () => { li.classList.toggle('completed'); this.save(list); };
            checkbox.addEventListener('change', toggle);
            span.addEventListener('click', () => { checkbox.checked = !checkbox.checked; toggle(); });

            list.prepend(li);
        },

        add: function(input, list) {
            const text = input.value.trim();
            if (text) {
                this.createEl(text, false, list);
                this.save(list);
                input.value = '';
            }
        },

        clear: function(list, all) {
            if (all && confirm("Delete ALL tasks?")) {
                list.innerHTML = "";
                localStorage.removeItem('dashboardWidgetTodo');
                Dashboard.Utils.toast("Tasks cleared!", "success");
            } else if (!all) {
                list.querySelectorAll('.todo-item input:checked').forEach(cb => cb.closest('li').remove());
            }
            this.save(list); // Save will trigger checkEmpty
        }
    },

    // 6. Rock Paper Scissors Module
    RPS: {
        init: function() {
            const msg = Dashboard.Utils.$("msg");
            if (!msg) return; // Exit if widget missing
            
            let uScore = 0, cScore = 0;
            const uPara = Dashboard.Utils.$("user-score");
            const cPara = Dashboard.Utils.$("comp-score");
            
            const play = (choice) => {
                const comp = ["rock", "paper", "scissors"][Dashboard.Utils.randomInt(3)];
                if (choice === comp) {
                    msg.innerText = "Draw!";
                    msg.style.backgroundColor = "#1e3a5f";
                } else {
                    const win = (choice === "rock" && comp === "scissors") || 
                                (choice === "paper" && comp === "rock") || 
                                (choice === "scissors" && comp === "paper");
                    
                    if (win) {
                        uScore++;
                        uPara.innerText = uScore;
                        msg.innerText = `You won! ${choice} beats ${comp}`;
                        msg.style.backgroundColor = "#22c55e";
                    } else {
                        cScore++;
                        cPara.innerText = cScore;
                        msg.innerText = `Lost. ${comp} beats ${choice}`;
                        msg.style.backgroundColor = "#ef4444";
                    }
                }
            };

            Dashboard.Utils.selectAll(".rps-widget .choice").forEach(c => {
                c.addEventListener("click", () => play(c.id));
            });

            Dashboard.Utils.$("rps-reset-btn").addEventListener("click", () => {
                uScore = 0; cScore = 0;
                uPara.innerText = "0"; cPara.innerText = "0";
                msg.innerText = "Play your move";
                msg.style.backgroundColor = "#1e3a5f";
            });
        }
    },

    // 7. Tic Tac Toe Module
    TTT: {
        init: function() {
            const cells = Dashboard.Utils.selectAll('.ttt-cell');
            const status = Dashboard.Utils.$('ttt-status');
            const reset = Dashboard.Utils.$('ttt-reset');
            if (cells.length === 0) return;

            let turn = 'x', board = Array(9).fill(''), active = true;
            const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

            cells.forEach(cell => {
                cell.addEventListener('click', () => {
                    const i = cell.dataset.index;
                    if (board[i] === '' && active) {
                        board[i] = turn;
                        cell.innerText = turn.toUpperCase();
                        cell.classList.add(turn);
                        
                        let won = wins.some(w => board[w[0]] && board[w[0]] === board[w[1]] && board[w[0]] === board[w[2]]);
                        
                        if (won) {
                            status.innerText = `Player ${turn.toUpperCase()} Wins!`;
                            status.style.color = "#22c55e";
                            active = false;
                        } else if (!board.includes('')) {
                            status.innerText = "It's a Draw!";
                            active = false;
                        } else {
                            turn = turn === 'x' ? 'o' : 'x';
                            status.innerText = `Player ${turn.toUpperCase()}'s Turn`;
                        }
                    }
                });
            });

            reset.addEventListener('click', () => {
                board.fill('');
                active = true;
                turn = 'x';
                status.innerText = "Player X's Turn";
                status.style.color = "#fff";
                cells.forEach(c => { c.innerText = ''; c.classList.remove('x','o'); });
            });
        }
    },

    // 8. Guess Number Module
    Guess: {
        init: function() {
            const btn = Dashboard.Utils.$('guess-btn');
            const input = Dashboard.Utils.$('guess-input');
            const msg = Dashboard.Utils.$('guess-msg');
            const count = Dashboard.Utils.$('guess-count');
            const prev = Dashboard.Utils.$('guess-prev');
            if (!btn) return;

            let rand = Dashboard.Utils.randomInt(100) + 1;
            let attempts = 0, history = [];

            const handleGuess = () => {
                const val = parseInt(input.value);
                if (isNaN(val) || val < 1 || val > 100) {
                    msg.innerText = "Enter 1-100!";
                    Dashboard.Utils.toast("Please enter a number between 1 and 100", "error");
                    msg.style.color = "#ef4444";
                    return;
                }
                history.push(val);
                attempts++;
                count.innerText = attempts;
                prev.innerText = history.join(', ');

                if (val === rand) {
                    msg.innerText = "🎉 Correct!";
                    msg.style.color = "#22c55e";
                    setTimeout(() => {
                        rand = Dashboard.Utils.randomInt(100) + 1;
                        attempts = 0; history = [];
                        count.innerText = "0"; prev.innerText = "";
                        msg.innerText = "Start Game"; msg.style.color = "#fff";
                    }, 3000);
                } else {
                    msg.innerText = val < rand ? "Too Low! ⬆️" : "Too High! ⬇️";
                    msg.style.color = "#f59e0b";
                }
                input.value = "";
                input.focus();
            };

            btn.addEventListener('click', handleGuess);
            input.addEventListener('keypress', (e) => { if(e.key === "Enter") handleGuess(); });
        }
    },

    // 9. BMI Module
    BMI: {
        init: function() {
            const btn = Dashboard.Utils.$('bmi-btn');
            if (!btn) return;

            btn.addEventListener('click', () => {
                const h = parseFloat(Dashboard.Utils.$('bmi-height').value);
                const w = parseFloat(Dashboard.Utils.$('bmi-weight').value);
                const res = Dashboard.Utils.$('bmi-result');
                const cat = Dashboard.Utils.$('bmi-category');

                if (!h || !w) { cat.innerText = "Enter details"; return; }
                const bmi = (w / ((h*h)/10000)).toFixed(1);
                res.innerText = bmi;
                
                cat.classList.remove('bmi-normal', 'bmi-bad');
                let txt = "", cls = "bmi-bad";
                if (bmi < 18.5) txt = "Underweight";
                else if (bmi < 25) { txt = "Normal"; cls = "bmi-normal"; }
                else if (bmi < 30) txt = "Overweight";
                else txt = "Obese";
                
                cat.innerText = txt;
                cat.classList.add(cls);
            });
        }
    },

    // 10. Currency Module
    Currency: {
        init: function() {
            const btn = Dashboard.Utils.$('curr-btn');
            const from = Dashboard.Utils.$('curr-from');
            const to = Dashboard.Utils.$('curr-to');
            const swap = Dashboard.Utils.$('curr-swap-btn');
            const input = Dashboard.Utils.$('curr-amount');
            const res = Dashboard.Utils.$('curr-result');
            
            if (!btn) return;

            const countries = {
                AED: "AE",
                AFN: "AF",
                XCD: "AG",
                ALL: "AL",
                AMD: "AM",
                ANG: "AN",
                AOA: "AO",
                AQD: "AQ",
                ARS: "AR",
                AUD: "AU",
                AZN: "AZ",
                BAM: "BA",
                BBD: "BB",
                BDT: "BD",
                XOF: "BE",
                BGN: "BG",
                BHD: "BH",
                BIF: "BI",
                BMD: "BM",
                BND: "BN",
                BOB: "BO",
                BRL: "BR",
                BSD: "BS",
                NOK: "BV",
                BWP: "BW",
                BYR: "BY",
                BZD: "BZ",
                CAD: "CA",
                CDF: "CD",
                XAF: "CF",
                CHF: "CH",
                CLP: "CL",
                CNY: "CN",
                COP: "CO",
                CRC: "CR",
                CUP: "CU",
                CVE: "CV",
                CYP: "CY",
                CZK: "CZ",
                DJF: "DJ",
                DKK: "DK",
                DOP: "DO",
                DZD: "DZ",
                ECS: "EC",
                EEK: "EE",
                EGP: "EG",
                ETB: "ET",
                EUR: "FR",
                FJD: "FJ",
                FKP: "FK",
                GBP: "GB",
                GEL: "GE",
                GGP: "GG",
                GHS: "GH",
                GIP: "GI",
                GMD: "GM",
                GNF: "GN",
                GTQ: "GT",
                GYD: "GY",
                HKD: "HK",
                HNL: "HN",
                HRK: "HR",
                HTG: "HT",
                HUF: "HU",
                IDR: "ID",
                ILS: "IL",
                INR: "IN",
                IQD: "IQ",
                IRR: "IR",
                ISK: "IS",
                JMD: "JM",
                JOD: "JO",
                JPY: "JP",
                KES: "KE",
                KGS: "KG",
                KHR: "KH",
                KMF: "KM",
                KPW: "KP",
                KRW: "KR",
                KWD: "KW",
                KYD: "KY",
                KZT: "KZ",
                LAK: "LA",
                LBP: "LB",
                LKR: "LK",
                LRD: "LR",
                LSL: "LS",
                LTL: "LT",
                LVL: "LV",
                LYD: "LY",
                MAD: "MA",
                MDL: "MD",
                MGA: "MG",
                MKD: "MK",
                MMK: "MM",
                MNT: "MN",
                MOP: "MO",
                MRO: "MR",
                MTL: "MT",
                MUR: "MU",
                MVR: "MV",
                MWK: "MW",
                MXN: "MX",
                MYR: "MY",
                MZN: "MZ",
                NAD: "NA",
                XPF: "NC",
                NGN: "NG",
                NIO: "NI",
                NPR: "NP",
                NZD: "NZ",
                OMR: "OM",
                PAB: "PA",
                PEN: "PE",
                PGK: "PG",
                PHP: "PH",
                PKR: "PK",
                PLN: "PL",
                PYG: "PY",
                QAR: "QA",
                RON: "RO",
                RSD: "RS",
                RUB: "RU",
                RWF: "RW",
                SAR: "SA",
                SBD: "SB",
                SCR: "SC",
                SDG: "SD",
                SEK: "SE",
                SGD: "SG",
                SKK: "SK",
                SLL: "SL",
                SOS: "SO",
                SRD: "SR",
                STD: "ST",
                SVC: "SV",
                SYP: "SY",
                SZL: "SZ",
                THB: "TH",
                TJS: "TJ",
                TMT: "TM",
                TND: "TN",
                TOP: "TO",
                TRY: "TR",
                TTD: "TT",
                TWD: "TW",
                TZS: "TZ",
                UAH: "UA",
                UGX: "UG",
                USD: "US",
                UYU: "UY",
                UZS: "UZ",
                VEF: "VE",
                VND: "VN",
                VUV: "VU",
                YER: "YE",
                ZAR: "ZA",
                ZMK: "ZM",
                ZWD: "ZW"        
            };
            // Populate Dropdowns
            const fill = (sel, def) => {
                for (let c in countries) {
                    let opt = document.createElement("option");
                    opt.value = c; opt.innerText = c;
                    if(c === def) opt.selected = true;
                    sel.appendChild(opt);
                }
            };
            fill(from, "USD");
            fill(to, "INR");

            const convert = async () => {
                const amt = input.value || 1;
                res.innerText = "Fetching...";
                try {
                    // Note: API key is exposed client-side, which is standard for these demos but unsafe for prod
                    const key = "cur_live_kRqRAM85HmPrwukbznry6INCClu252vFyeHVJc7H"; 
                    const url = `https://api.currencyapi.com/v3/latest?apikey=${key}&base_currency=${from.value}&currencies=${to.value}`;
                    let data = await (await fetch(url)).json();
                    let rate = data.data[to.value].value;
                    res.innerText = `${amt} ${from.value} = ${(amt * rate).toFixed(2)} ${to.value}`;
                } catch (e) { res.innerText = "API Error"; }
            };

            btn.addEventListener('click', convert);
            if(swap) swap.addEventListener('click', () => {
                const temp = from.value; from.value = to.value; to.value = temp;
                convert();
            });
        }
    },

    // 11. Theme Toggler Module
    Theme: {
        init: function() {
            const btn = Dashboard.Utils.$('themeToggle');
            if (!btn) return;

            // 1. Check LocalStorage on load
            const currentTheme = localStorage.getItem('dashboardTheme');
            if (currentTheme === 'light') {
                document.body.classList.add('light-mode');
                btn.innerText = "☀️"; // Sun icon for light mode
            }

            // 2. Toggle Logic
            btn.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                
                const isLight = document.body.classList.contains('light-mode');
                btn.innerText = isLight ? "☀️" : "🌙"; // Switch icon
                
                // Save preference
                localStorage.setItem('dashboardTheme', isLight ? 'light' : 'dark');
            });
        }
    },

    // 12. Pomodoro & Stopwatch Module
    Timer: {
        interval: null,
        timeLeft: 1500, // 25 mins in seconds
        totalTime: 1500,
        isRunning: false,
        mode: 'pomo', // 'pomo' or 'sw' (stopwatch)
        swTime: 0, // Stopwatch elapsed time (ms)

        init: function() {
            const display = Dashboard.Utils.$('timer-display');
            const label = Dashboard.Utils.$('timer-label');
            const progress = Dashboard.Utils.$('timer-progress');
            const startBtn = Dashboard.Utils.$('timer-start');
            const pauseBtn = Dashboard.Utils.$('timer-pause');
            const resetBtn = Dashboard.Utils.$('timer-reset');
            const btnPomo = Dashboard.Utils.$('mode-pomo');
            const btnSw = Dashboard.Utils.$('mode-sw');

            if (!display) return;

            // Helper to format time
            const format = (seconds) => {
                const m = Math.floor(seconds / 60).toString().padStart(2, '0');
                const s = (seconds % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
            };

            const formatSW = (ms) => {
                const m = Math.floor(ms / 60000).toString().padStart(2, '0');
                const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
                const milli = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
                return `${m}:${s}:${milli}`;
            };

            const updateUI = () => {
                if (this.mode === 'pomo') {
                    display.innerText = format(this.timeLeft);
                    const pct = (this.timeLeft / this.totalTime) * 100;
                    progress.style.width = `${pct}%`;
                    label.innerText = this.isRunning ? "Stay Focused" : "Ready?";
                } else {
                    display.innerText = formatSW(this.swTime);
                    progress.style.width = '100%'; // Always full for stopwatch
                    label.innerText = this.isRunning ? "Timing..." : "Stopwatch";
                }
            };

            const toggleControls = (running) => {
                this.isRunning = running;
                if (running) {
                    startBtn.style.display = 'none';
                    pauseBtn.style.display = 'inline-block';
                } else {
                    startBtn.style.display = 'inline-block';
                    pauseBtn.style.display = 'none';
                }
            };

            // Switch Modes
            const switchMode = (newMode) => {
                this.stop();
                this.mode = newMode;
                
                // Toggle active class
                if (newMode === 'pomo') {
                    btnPomo.classList.add('active');
                    btnSw.classList.remove('active');
                    this.timeLeft = 1500;
                    display.style.fontSize = '4rem'; // Normal size
                } else {
                    btnSw.classList.add('active');
                    btnPomo.classList.remove('active');
                    this.swTime = 0;
                    display.style.fontSize = '3.5rem'; // Slightly smaller for ms
                }
                updateUI();
            };

            // Timer Logic
            this.start = () => {
                if (this.isRunning) return;
                toggleControls(true);

                let lastTime = Date.now();
                
                this.interval = setInterval(() => {
                    const now = Date.now();
                    const delta = now - lastTime;
                    lastTime = now;

                    if (this.mode === 'pomo') {
                        if (this.timeLeft > 0) {
                            // Approximately decrement by 1 sec
                            // (Logic simplified for readability, usually delta is better)
                            this.timeLeft--; 
                            if(this.timeLeft === 0) {
                                this.stop();
                                Dashboard.Utils.toast("Time's up! Take a break.");

                            }
                        }
                    } else {
                        this.swTime += delta;
                    }
                    updateUI();
                }, (this.mode === 'pomo' ? 1000 : 10)); // Update freq
            };

            this.stop = () => {
                clearInterval(this.interval);
                toggleControls(false);
            };

            this.reset = () => {
                this.stop();
                if (this.mode === 'pomo') this.timeLeft = 1500;
                else this.swTime = 0;
                updateUI();
            };

            // Listeners
            startBtn.addEventListener('click', () => this.start());
            pauseBtn.addEventListener('click', () => this.stop());
            resetBtn.addEventListener('click', () => this.reset());
            
            btnPomo.addEventListener('click', () => switchMode('pomo'));
            btnSw.addEventListener('click', () => switchMode('sw'));

            // Init
            updateUI();
        }
    },

    // 15. Tab Switching Module
    Tabs: {
        init: function() {
            const btns = Dashboard.Utils.selectAll('.tab-btn');
            const sections = Dashboard.Utils.selectAll('.tab-content');

            if (!btns.length) return;

            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // 1. Remove active class from all buttons and sections
                    btns.forEach(b => b.classList.remove('active'));
                    sections.forEach(s => s.classList.remove('active'));

                    // 2. Add active to clicked button
                    btn.classList.add('active');

                    // 3. Show target section
                    const targetId = btn.getAttribute('data-target');
                    const targetSection = Dashboard.Utils.$(targetId);
                    if (targetSection) {
                        targetSection.classList.add('active');
                    }
                    
                    // Optional: Sound effect
                    if(Dashboard.AudioFX) Dashboard.AudioFX.playTone(600, 'sine', 0.1);
                });
            });
        }
    },

    // 16. Calculator Module
    Calculator: {
        init: function() {
            const display = document.querySelector('.calc-display');
            const keys = Dashboard.Utils.selectAll('.calc-btn');
            if(!display) return;

            let currentInput = "";
            
            keys.forEach(key => {
                key.addEventListener('click', (e) => {
                    const val = e.target.getAttribute('data-val');
                    
                    if(val === 'C') {
                        currentInput = "";
                        display.innerText = "0";
                    } 
                    else if(val === 'DEL') {
                        currentInput = currentInput.slice(0, -1);
                        display.innerText = currentInput || "0";
                    } 
                    else if(val === '=') {
                        try {
                            // Safe evaluation for simple math
                            // Replace visual operators with JS operators
                            let evalString = currentInput.replace(/×/g, "*").replace(/÷/g, "/");
                            currentInput = String(eval(evalString));
                            display.innerText = currentInput;
                        } catch {
                            display.innerText = "Error";
                            currentInput = "";
                        }
                    } 
                    else {
                        // Prevent multiple decimals
                        if(val === '.' && currentInput.includes('.')) return;
                        currentInput += val;
                        display.innerText = currentInput;
                    }
                });
            });
        }
    },

};

// Start the Dashboard
document.addEventListener('DOMContentLoaded', () => Dashboard.init());