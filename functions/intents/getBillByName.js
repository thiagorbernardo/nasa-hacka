/* Commom functions */
const getData = require("../commom/getData");
/* Variables */
const GoogleAPIUrl = 'https://google-claro.now.sh'
module.exports = async function getBillByName(userName, deviceNumber) {

    const url = `${GoogleAPIUrl}/api/admin/user/getBillByName?userName=${userName}`;
    const response = await getData(url);

    if (response != false) {
        let len = response.billMonths.length
        const bill = response.billMonths[0].devices;
        for (let i = 0; i < bill.length; i++) {
            if(bill[i].number == deviceNumber)
                return bill[i].value;
        }
        return bill;
    } else {
        return false;
    }
}