'use strict';
/* Modules */
const fetch = require('node-fetch');
/* Master Functions for Intents  */
const getBillByName = require("./intents/getBillByName");
const getNearbyPlace = require("./intents/getNearbyPlace");
// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
    dialogflow,
    BasicCard,
    Permission,
    Suggestions,
    Button,
    Carousel,
    Image,
    MediaObject,
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });
// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', async (conv) => {
    console.log('LOCATION ' + conv.user.storage.location);
    conv.user.storage = {};
    const name = conv.user.storage.userName;
    const location = conv.user.storage.location;
    if (!name || !location) {
        // Asks the user's permission to know their name, for personalization.
        conv.ask(new Permission({
            context: 'Olá, para te conhecer melhor',
            permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
        }));
    } else {
        conv.ask(`Oi, ${name}. Espero que esteja se sentindo bem. O que deseja fazer?`);
        conv.ask(new Suggestions('Onde encontro um hospital', 'Onde encontro uma farmácia'));
    }
});
app.intent('Local Search', async (conv, { local }) => {
    if (!conv.user.storage.location) {
        conv.ask(new Permission({
            context: 'Eu preciso da sua localização',
            permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
        }));
    } else {
        let location = conv.user.storage.location;
        let coord = location.coordinates;
        let city = location.city;
        let adress = location.formattedAddress;
        conv.ask(`você está em ${coord.latitude}, ${coord.longitude}, ${city} e ${adress}`)
        /*const latLong = conv.device.location;
        //conv.user.storage.location = conv.device.location;
        const nearbyPlace = await getNearbyPlace(local, latLong)
        conv.ask(`O ${local} mais perto de você é o ${nearbyPlace.name}, que fica na ${nearbyPlace.vicinity}`);
        conv.ask(new Suggestions('Onde encontro um hospital', 'Onde encontro uma farmácia'));*/
    }
});

app.intent('actions_intent_PERMISSION', (conv, {cpf, birthDate, phone, cep}, permissionGranted) => {
    if (!permissionGranted) {
        conv.ask('Ok, sem problemas.');
        conv.ask(new Suggestions('Onde encontro um hospital', 'Onde encontro uma farmácia'));
    } else {
        conv.user.storage.userName = conv.user.name.display;
        conv.user.storage.location = conv.device.location;
        conv.user.storage.userData = {
            "name": conv.user.storage.userName,
            "coords": conv.user.storage.location.coordinates,
            "cpf": cpf,
            "birthDate": birthDate,
            "phone": phone,
            "cep": cep
        }
        console.log('DADOSSSSSSSS', conv.user.storage.userData);
        conv.ask(`Obrigado, ${conv.user.storage.userName}, todas suas informações foram salvas. O que deseja procurar?`);
        conv.ask(new Suggestions('Onde encontro um hospital', 'Onde encontro uma farmácia'));
    }
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);