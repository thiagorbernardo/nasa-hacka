/* Commom functions */
const getData = require("../commom/getData");
/* Variables */
const API_KEY = 'AIzaSyC_zyB_IE5RqXxZEpFWPEtfpCVMenCDg-Y';
module.exports = async function getNearbyPlace(type, location) {

    const radius = 2000;
    const language = 'pt-BR'
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&type=${type}&language=${language}&key=${API_KEY}`;
    console.log('LATITUDE', location.latitude)
    console.log('LONGITUDE', location.longitude)
    console.log('URLLLLL', url)
    const response = await getData(url);
    console.log('RESPONSEEEE', response)
    return response
    
}