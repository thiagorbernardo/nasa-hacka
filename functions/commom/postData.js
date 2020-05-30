const fetch = require('node-fetch');
module.exports = async function postData(url, obj) {
    return await fetch(url, {
        method: 'post',
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' },
    })
        .then(res => res.json()) // expecting a json response
        .then(json => {
            console.log('Data Posted', json);
        })
        .catch(err => {
            console.log(err);
        });
}