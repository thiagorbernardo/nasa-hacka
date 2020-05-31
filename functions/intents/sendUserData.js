/* Commom functions */
const postData = require("../commom/postData");
/* Variables */
const GoogleAPIUrl = 'https://google-claro.now.sh'
module.exports = async function sendUserData(obj) {
    console.log('DADOSSSSSSSS', obj);
    const url = `${GoogleAPIUrl}/api/admin/user/setUserData`;
    await postData(url, obj);
}