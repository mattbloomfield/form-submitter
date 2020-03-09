
document.getElementById('Form')
.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    try {
        const name = document.getElementById('Name').value;
        const email = document.getElementById('Email').value;
        const phone = document.getElementById('Phone').value;
        const response = await request('POST','/submit', {json: true, body: {
            name, email, phone
        }});
        if (response.status == 'success') {
            document.getElementById('Form').style.display = 'none';
            document.getElementById('Status').innerHTML = 'Congratulations, you\'re in! <br /><br />Check out <a href="#">our current initiatives</a> to get started.';
        }
    } catch (e) {
        console.error('A problem occurred while submitting this form', e);
        document.getElementById('Status').innerHTML = 'Uh oh... an issue kept this form from submitting. Please try again later.';
        document.getElementById('Status').classList = 'error-text';
    }
});

/**
 * I lifted this handy function from another project I wrote recently
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
                reject(xhr.status);
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