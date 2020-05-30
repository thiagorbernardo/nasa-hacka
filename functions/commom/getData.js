const fetch = require('node-fetch');
module.exports = async function getData(url) {
    return await fetch(url)
        .then(res => res.json()) // expecting a json response
        .then(json => {
            return json;
        })
        .catch(err => {
            console.log(err);
        });
}