const credentials = require('../credentials.json');
const mysql = require('mysql');
const SQL = require('sql-template-strings')
const express = require('express');
const bodyParser = require('body-parser');
const sqlinjection = require('sql-injection');
const app = express();

const port = 3535;

const twilioClient = require('twilio')(credentials.twilio.accountSid, credentials.twilio.authToken);

const sqlPool = mysql.createPool({
    connectionLimit: 10,
    host: credentials.mysql.host,
    user: credentials.mysql.user,
    password: credentials.mysql.password,
    database: credentials.mysql.database,
});

// might be good to check if the submissions table exists and create it if not

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(sqlinjection);

app.post('/submit', function (req, res) {
    const subName = req.body.name;
    const subEmail = req.body.email;
    const subPhone = req.body.phone;
    if (!subName || !subEmail || !subPhone) {
        respondWithError(res, 400, {
            status: 'Missing Fields',
            message: 'Please include `name`, `email`, and `phone` in the body of this request'
        });
        return;
    }
    // We should handle basic sql injection problems here. 
    // Using npm package middleware for brevity sake but haven't truly explored it's abilities
    let query = SQL`INSERT IGNORE INTO `;
    query.append(credentials.mysql.table);
    query.append(SQL`
        (name, email, phone)
        VALUES (${subName}, ${subEmail}, ${subPhone})
    `);
    sqlPool.query(query, (error, results) => {
        if (error) throw error;
        res.json({
            status: `success`, 
            message: results[0]
        })
    });
});

/**
 * Return all users who have signed up
 * This could get big over time so we are using a limit in the query as a circuit breaker
 * It could be paginated later
 */
app.get('/submissions', function (req, res) {
    const token = req.query.token;
    if (token !== credentials.adminToken) return respondWithError(res, 401, {
        status: 'unauthorized',
        message: 'This request requires authorization'
    });
    let query = SQL`SELECT * FROM `;
    query.append(credentials.mysql.table);
    query.append(SQL` LIMIT 250`);
    sqlPool.query(query,  (error, results) => {
        if (error) throw error;
        res.json({
            status: `success`, 
            result: results
        });
    });
});

app.post('/send-message', function (req, res) {
    const token = req.query.token;
    const message = req.body.message;
    if (token !== credentials.adminToken) return respondWithError(res, 401, {
        status: 'unauthorized',
        message: 'This request requires authorization'
    });
    let query = SQL`SELECT phone FROM `;
    query.append(credentials.mysql.table);
    sqlPool.query(query, (error, results) => {
        if (error) throw error;
        const numbers = results.map(obj => {
            return obj.phone;
        }).filter(phone=> phone.length);
        Promise.all(
            numbers.map(number => {
                return twilioClient.messages.create({
                to: number,
                from: credentials.twilio.phoneNumber,
                body: message
                });
            })
            )
            .then(messages => {
                res.json({
                    status: 'success',
                    message: `Successfully sent ${messages.length} messages`
                })
            })
            .catch(err => {
                console.error(err);
                res.status(500);
                res.json({
                    status: err.status || 'error',
                    message: 'An error has occurred while sending the messages',
                    error: err
                })
            });

    });
});

const respondWithError = (res, status, responseObj) => {
    res.status(status || 500);
    res.json(responseObj);
}

app.listen(port, () => {
    console.log(`Application listening on http://localhost:${port}`)
});