/* Commom functions */
const getData = require("../commom/getData");
/* Variables */
const API_KEY = 'AIzaSyC_zyB_IE5RqXxZEpFWPEtfpCVMenCDg-Y';
module.exports = async function getNearbyPlace(type, local) {

    const radius = 2000;
    const language = 'pt-BR'
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${local}&radius=${radius}&type=${type}&language=${language}&key=${API_KEY}`;
    const response = await getData(url);
    if(response.status == 'OK') 
        return response.results[0]
    return `Infelizmente ocorreu um erro procurando por ${type}`
    
}