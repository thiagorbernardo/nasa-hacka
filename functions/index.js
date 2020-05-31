'use strict';
/* Modules */
const fetch = require('node-fetch');
const { AgeFromDateString } = require('age-calculator');
/* Master Functions for Intents  */
const sendUserData = require("./intents/sendUserData");
const sendUserSymptoms = require("./intents/sendUserSymptoms");
const getNearbyPlace = require("./intents/getNearbyPlace");
const prepareObj = require("./commom/prepareObj");
const checkUserRisk = require("./commom/checkUserRisk");
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
    RegisterUpdate
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });
// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', async (conv) => {
    //conv.user.storage = {};
    const name = conv.user.storage.userName;
    const location = conv.user.storage.location;
    if (!name || !location) {
        // Asks the user's permission to know their name, for personalization.
        conv.ask(new Permission({
            context: 'Hi, to get to know you better',
            permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
        }));
    } else {
        conv.ask(`Hi, ${name}. Hope you feeling good. What do you want to do?`);
        conv.ask(new Suggestions('Talk about my symptoms', 'Nearby Hospital', 'Nearby Pharmacy', 'Daily updates'));
    }
});
app.intent('Local Search', async (conv, { local }) => {
    if (!conv.user.storage.location) {
        conv.ask(new Permission({
            context: 'I need some info',
            permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
        }));
    } else {
        const location = conv.user.storage.location;
        const coord = location.coordinates;
        let nearbyPlace = await getNearbyPlace(local, coord);
        if (nearbyPlace.status == 'OK') {
            nearbyPlace = nearbyPlace.results[0]
            conv.ask(`The nearby ${local} is ${nearbyPlace.name} on ${nearbyPlace.vicinity}`);
        } else
            conv.ask(`There is no ${local} nearby.`);
        conv.ask(new Suggestions('Nearby Hospital', 'Nearby Pharmacy'));
    }
});

app.intent('actions_intent_PERMISSION', async (conv, { cpf, birthDate, phone, cep, height, weight, isWoman, pregnancy }, permissionGranted) => {
    if (!permissionGranted) {
        conv.ask('Ok, no problem.');
        conv.ask(new Suggestions('Nearby Hospital', 'Nearby Pharmacy'));
    } else {
        conv.user.storage.userName = conv.user.name.display;
        conv.user.storage.location = conv.device.location;
        conv.user.storage.location.coordinates.latitude = -25.436919 //-25.436919, -49.273851
        conv.user.storage.location.coordinates.longitude = -49.273851

        conv.user.storage.userData = {
            "Name": conv.user.storage.userName,
            "Coords": conv.user.storage.location.coordinates,
            "City": conv.user.storage.location.city,
            "CPF": cpf,
            "Birth Date": birthDate,
            "Phone": phone,
            "Height": height,
            "Weight": weight,
            "CEP": cep,
            "isWoman": isWoman,
            "Pregnancy": pregnancy,
            "Cormobity": []
        }

        conv.ask("Are you doing some kind of healthcare for chronic disease?")
        conv.ask(new Suggestions('Yes', 'No'));
    }
});

app.intent('actions_intent_PERMISSION - yes', async (conv, { diabetes, heartDesease, kidney, pulmonary, hypertension }) => {
    let order = ["Diabetes", "HeartDesease", "Kidney", "Pulmonary", "Hypertension"];
    let values = [diabetes, heartDesease, kidney, pulmonary, hypertension];
    let illness = [];
    for (let i = 0; i < values.length; i++) {
        illness.push(prepareObj(order[i], values[i]));
    }
    console.log('COMORBIDADESSSSSS', illness)
    conv.user.storage.userData.Cormobity = illness;
    let userData = conv.user.storage.userData;
    await sendUserData(userData);
    conv.ask(`Thank you, ${conv.user.storage.userName}, all your info was saved. What do you want to do now?`);
    conv.ask(new Suggestions('Talk about my symptoms', 'Nearby Hospital', 'Nearby Pharmacy'));

});
app.intent('actions_intent_PERMISSION - no', async (conv) => {

    let userData = conv.user.storage.userData;
    await sendUserData(userData);
    conv.ask(`Thank you, ${conv.user.storage.userName}, all your info was saved. What do you want to do now?`);
    conv.ask(new Suggestions('Talk about my symptoms', 'Nearby Hospital', 'Nearby Pharmacy'));

});

app.intent('Register Symptoms', async (conv, { breathing, throat, fever, cough, muscleAches, nausea, headache, fatigue, nasal }) => {
    let order = ["Breathing", "Throat", "Fever", "Cough", "MuscleAches", "Nausea", "Headache", "Fatigue", "Nasal"]
    let values = [breathing, throat, fever, cough, muscleAches, nausea, headache, fatigue, nasal]
    let symptoms = [];
    for (let i = 0; i < values.length; i++) {
        symptoms.push(prepareObj(order[i], values[i]));
    }
    let userSymptoms = conv.user.storage.symptoms = {
        "CPF": conv.user.storage.userData.CPF,
        "Symptoms": symptoms
    }
    await sendUserSymptoms(userSymptoms);
    if (!conv.user.storage.dailyUpdate) {
        conv.ask('I can send you daily updates to remember to check your symptoms again. Would you like that?');
        conv.ask(new Suggestions('Send daily updates'));
        conv.user.storage.dailyUpdate == true;
    }

    //Now sent to hospital or pharmacy
});

app.intent('Subscribe to Daily Updates', (conv) => {
    conv.ask("Choose the hours to receive daily updates");
    conv.ask(new RegisterUpdate({
        intent: 'Register Symptoms',
        frequency: 'DAILY',
    }));
});

app.intent('Confirm Daily Updates Subscription', (conv, params, registered) => {
    console.log('HORASSSSSSSS', new Date());
    if (registered && registered.status === 'OK') {
        conv.close(`Ok, I'll Talk about my symptoms giving you daily updates.`);
    } else {
        conv.close(`Ok, I won't give you daily updates.`);
    }
});
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
//firebase deploy && clear && echo "Deploy realizado as" && date +%H:%M