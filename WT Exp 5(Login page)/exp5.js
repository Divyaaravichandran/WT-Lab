const http = require('http');

const users = [];

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const style = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
            body { 
                font-family: 'Poppins', sans-serif; 
                text-align: center; 
                background: white;
                display: flex;
                justify-content: center; 
                align-items: center;
            }
            .container {
                background: white; 
                color: #333;
                padding: 20px; 
                width: 320px; 
                border-radius: 10px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
            input {
                width: 100%; 
                margin: 10px 0; 
                padding: 10px; 
                border: 1px solid #ccc;
                border-radius: 5px;
            }
            button {
                background: #28a745; 
                color: white; 
                padding: 12px; 
                border: none; 
                cursor: pointer; 
                width: 100%;
                border-radius: 5px;
                transition: 0.3s;
            }
            button:hover {
                background: #218838;
            }
            a { 
                display: block; 
                margin-top: 20px; 
                color: #667eea; 
                font-weight: bold;
                text-decoration: none;
            }
        </style>
    `;

    const routes = {
        '/': `
            ${style}
            <div class="container">
                <h2>Sign Up</h2>
                <form action="/signup">
                    <input name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Sign Up</button>
                </form>
                <a href="/login">Login</a>
            </div>
        `,
        '/login': `
            ${style}
            <div class="container">
                <h2>Login</h2>
                <form method="POST">
                    <input name="username" placeholder="Username" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        `
    };

    if (req.method === 'GET') {
        if (routes[req.url]) return res.end(routes[req.url]);
        if (req.url.startsWith('/signup')) {
            const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
            users.push({ username: query.get('username'), password: query.get('password') });
            return res.end(`${style}<div class="container"><h2>Sign Up Successful</h2><a href="/login">Login Here</a></div>`);
        }
    }
    if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const user = users.find(u => u.username === params.get('username') && u.password === params.get('password'));
            res.end(`${style}<div class="container">${user ? '<h2>Login Successful</h2>' : '<h2>Login Failed</h2>'}</div>`);
        });
    }
});

server.listen(3000, () => console.log('Server running on port 3000'));
