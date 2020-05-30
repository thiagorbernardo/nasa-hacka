/*const getData = require("../commom/getData.js");
const setWordRequirements = require("../commom/setWordRequirements.js");

const API_KEYDB = '33b98784c91a88fdf6bf36da722e8ece'
class ChannelService {
    async getMovie(movieName) {
        const language = 'pt-BR';
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEYDB}&language=${language}&query=${movieName}`;
        let response = await getData(url);

        if (response.results != []) {
            return response.results[0].overview;
        } else {
            return "Não achei este filme"
        }
    }

}

export default new ChannelService();
*/