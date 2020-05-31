/* Commom functions */
const postData = require("../commom/postData");
/* Variables */
const GoogleAPIUrl = 'https://google-claro.now.sh'
module.exports = async function sendUserSymptoms(obj) {
    console.log('DADOSSSSSSSS', obj);
    const url = `${GoogleAPIUrl}/api/admin/user/userSymptoms`;
    await postData(url, obj);
}