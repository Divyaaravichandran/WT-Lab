const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = 'employmentPortal';
let db;

client.connect()
    .then(() => {
        db = client.db(dbName);
        console.log('Connected to MongoDB');
        startServer();
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });

function startServer() {
    const server = http.createServer(async (req, res) => {
        if (!db) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            return res.end('Database connection not established');
        }

        if (req.method === 'GET') {
            if (req.url === '/') {
                serveFile(res, 'index.html', 'text/html');
            } else if (req.url.startsWith('/jobs')) {
                try {
                    const jobs = await db.collection('jobs').find().toArray();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(jobs));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error retrieving jobs');
                }
            } else {
                serveFile(res, req.url.substring(1), getContentType(req.url));
            }
        } 
        
        else if (['POST', 'DELETE', 'PUT'].includes(req.method)) {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const jobsCollection = db.collection('jobs');

                    if (req.url === '/addJob' && req.method === 'POST') {
                        await jobsCollection.insertOne(data);
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Job Added Successfully');
                    } 
                    
                    else if (req.url === '/deleteJob' && req.method === 'DELETE') {
                        const result = await jobsCollection.deleteOne({ _id: new ObjectId(data.id) });

                        if (result.deletedCount > 0) {
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end('Job Deleted Successfully');
                        } else {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('Job Not Found');
                        }
                    } 

                    else if (req.url === '/updateJob' && req.method === 'PUT') {
                        const result = await jobsCollection.updateOne(
                            { _id: new ObjectId(data.id) },
                            { $set: { location: data.location } }
                        );

                        if (result.modifiedCount > 0) {
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end('Job Updated Successfully');
                        } else {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('Job Not Found');
                        }
                    }

                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error processing request');
                }
            });
        } 
        
        else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
        }
    });

    server.listen(3000, () => console.log('Server running on port 3000'));
}

// Serve static files
function serveFile(res, fileName, contentType) {
    const filePath = path.join(__dirname, fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Page Not Found');
        } else {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error loading file');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                }
            });
        }
    });
}

// Determine content type
function getContentType(url) {
    const extname = path.extname(url);
    switch (extname) {
        case '.js': return 'text/javascript';
        case '.css': return 'text/css';
        case '.json': return 'application/json';
        case '.png': return 'image/png';
        case '.jpg': return 'image/jpg';
        default: return 'text/html';
    }
}
