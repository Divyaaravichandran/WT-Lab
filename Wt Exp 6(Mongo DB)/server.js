const http = require('http');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'usersDB';
let db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db(dbName);
        console.log('Connected to MongoDB');
    })
    .catch(err => console.error(err));

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            fs.readFile(__dirname + '/index.html', (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading page');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                }
            });
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            const data = JSON.parse(body);
            const usersCollection = db.collection('users');
            
            if (req.url === '/insert') {
                await usersCollection.insertOne(data);
                res.end('User Inserted');
            } 
            else if (req.url === '/update') {
                const user = await usersCollection.findOne({ username: data.username });
                if (user) {
                    await usersCollection.updateOne({ username: data.username }, { $set: { password: data.password } });
                    res.end('User Updated Successfully');
                } else {
                    res.writeHead(404);
                    res.end('User Not Found');
                }
            }            
            else if (req.url === '/delete') {
                const user = await usersCollection.findOne({ username: data.username });
                if(user) {
                    await usersCollection.deleteOne({ username: data.username });
                    res.end('User Deleted');
                } else {
                    res.writeHead(404);
                    res.end("User Not found");
                }

            } 
            
        });
    }
});

server.listen(3000, () => console.log('Server running on port 3000'));
