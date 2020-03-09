const globals = {};

const init = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) {
        document.getElementById('Content').innerHTML = 'This page requires authorization';
        return;
    }
    // storing this in global scope to keep from having to retrieve it for other auth issues
    globals.token = token;
    try {
        const response = await request('GET', '/submissions', {json: true, params: {token}});
        for (let i = 0; i < response.result.length; i++) {
            // it could make sense to break this out into another function but its ok for now
            const result = response.result[i];
            const cardEl = document.createElement('div');
            cardEl.id = `Person_${result.id}`;
            cardEl.classList = 'card';
            const nameEl = document.createElement('h4');
            const emailEl = document.createElement('h5');
            const phoneEl = document.createElement('h5');
            nameEl.innerHTML = result.name;
            emailEl.innerHTML = `<a href="mailto:${result.email}">${result.email}</a>`;
            phoneEl.innerHTML = `<a href="tel:${result.phone}">${result.phone}</a>`;
            //TODO: format the phone number nicely
            cardEl.appendChild(nameEl);
            cardEl.appendChild(emailEl);
            cardEl.appendChild(phoneEl);
            document.getElementById('Results').appendChild(cardEl);
        }
    } catch (e) {
        console.error('An error occurred while loading the results', e);
        alert('A problem occurred while getting the results...');
    }
};

document.getElementById('TextMessageForm')
.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try {
        const token = globals.token;
        const message = document.getElementById('TextMessageContent').value;
        const response = await request('POST', '/send-message', {json: true, params: {token}, body: {message}});
        if (response.status === 'success') {
            document.getElementById('Status').innerHTML = 'Message was sent successfully';
            document.getElementById('Status').classList = 'success-text';

        } else {
            document.getElementById('Status').innerHTML = 'An unknown error has occurred while sending the message. Please contact internal-support@gsrco.com';
            document.getElementById('Status').classList = 'error-text';
        }
    } catch (e) {
        console.error('An error occurred while sending the message', e);
        document.getElementById('Status').innerHTML = 'An error has occurred while sending the message. Please contact internal-support@gsrco.com';
            document.getElementById('Status').classList = 'error-text';
    }
})

/**
 * 
 * @param {string} requestType - The HTTP verb to use (GET, POST)
 * @param {string} url - The URL to use for the request
 * @param {object} options - Accepts a `json` param which will parse response to JSON, if `body` object included, will convert to stringified JSON and send. If `params` object included, will append as query parameters. 
 * @returns a promise
 */
const request = (requestType, url, options = {}) => {
    return new Promise((resolve, reject) => {
        if (options.params) {
            for (const param in options.params) {
                if (url.includes('?')) {
                    url += `&${param}=${options.params[param]}`;
                } else {
                    url += `?${param}=${options.params[param]}`;
                }
            }
        }
        const xhr = new XMLHttpRequest();
        xhr.open(requestType, url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    if (options.json) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        resolve(xhr.responseText);
                    }
                } catch (e) {
                    reject(e);
                }
            }
            else {
                reject({
                    status: xhr.status,
                    message: xhr.responseText
                });
            }
        };
        if (requestType == 'POST' && options.body) {
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(options.body));
        } else {
            xhr.send();
        }
    });
};

init();