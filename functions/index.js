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
    console.log(new Date());

    //conv.user.storage = {};
    const name = conv.user.storage.userName;
    const location = conv.user.storage.location;
    if (!name || !location) {
        conv.ask("I'm June Tracker's personal health assistant. I was created in the Nasa Space Apps challenge to help you assess your coronavirus symptoms (COVID-19).")
        conv.ask(new Permission({
            context: "Let's talk a little bit about you",
            permissions: ['NAME', 'DEVICE_PRECISE_LOCATION'],
        }));
    } else {
        conv.ask(`Hi, ${name}. Hope you feeling good. What do you want to do?`);
        conv.ask(new Suggestions('Talk about my symptoms', 'Nearby Hospital', 'Nearby Pharmacy'));
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
        conv.user.storage.location.coordinates.latitude = -25.436919; //-25.436919, -49.273851
        conv.user.storage.location.coordinates.longitude = -49.273851;

        conv.user.storage.userData = {
            "Name": conv.user.storage.userName,
            "Coords": conv.user.storage.location.coordinates,
            "City": conv.user.storage.location.city,
            "CPF": cpf,
            "BirthDate": birthDate,
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
    // console.log('COMORBIDADESSSSSS', illness)
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
    let userData = conv.user.storage.userData
    let userRisk = await checkUserRisk(symptoms, userData.Cormobity, userData.BirthDate);
    let userSymptoms = conv.user.storage.symptoms = {
        "CPF": userData.CPF,
        "Symptoms": symptoms,
        "FlagRisk": userRisk
    }
    await sendUserSymptoms(userSymptoms);
    if (userRisk == 3) {
        let nearbyPlace = await getNearbyPlace('hospital', userData.Coords);
        if (nearbyPlace.status == 'OK') {
            nearbyPlace = nearbyPlace.results[0];
            let urlPlace = `https://maps.google.com/?q=${nearbyPlace.vicinity}`
            urlPlace = `${urlPlace.split(' ').join('+')}/`
            conv.ask("This isn't a diagnosis. Based on your answers, I recommend that you seek health service for specific clinical follow-up. I'll suggest a closer unit. If you have any difficulties, call 192 now.");
            conv.ask(new BasicCard({
                text: "On the way, follow the individual protection precautions:\nChoose a family member who is outside the risk group to accompany you.\nUse masks to avoid transmission during the journey to the emergency service\nKeep a minimum distance of about 2 meters from anyone\nWash your hands with soap frequently \nAvoid touching your face without your hands being washed.",
                title: nearbyPlace.name,
                buttons: new Button({
                    title: "Let's go",
                    url: urlPlace,
                })
            }));
            conv.close("I hope that it is all right. I'll accompany you here, keep me informed.");
        } else {
            conv.close("Call 192 now.");
        }
    } else if (userRisk == 2) {
        conv.ask("This is not a diagnosis. Analyzing your answers, I believe that you must make a doctor's appointment. So that you do not run the risk of contamination in health units, I have just contacted a healthcare specialist to talk to you as soon as possible.");
        conv.ask("Meanwhile, I need you to follow some recommendations:\nKeep isolation at home\nWear a mask all the time\nChoose bath towels, forks, knives, spoons, glasses, and other objects just for your use\nThe waste produced needs to be separated and disposed of\nDo not share places of common use in your home\nKeep open window for air circulation");
        conv.ask("If your health gets worse quickly, call 192.");
    } else if (userRisk == 1) {
        conv.ask("I need to monitor the progress of your symptoms. Tell me urgently if you have a fever, difficulty breathing, or bluish-textured lips and hands. ");
        let nearbyPlace = await getNearbyPlace('pharmacy', userData.Coords);
        if (nearbyPlace.status == 'OK') {
            nearbyPlace = nearbyPlace.results[0];
            let urlPlace = `https://maps.google.com/?q=${nearbyPlace.vicinity}`
            urlPlace = `${urlPlace.split(' ').join('+')}/`
            conv.ask("If you need to go to a pharmacy, I'm sending you the recommendation of the nearest company.");
            conv.ask(new BasicCard({
                text: "In the meantime, I need you to follow some recommendations.\nWash your hands frequently\nKeep a minimum distance of about 2 meters from anyone coughing or sneezing\nSleep well and eat healthily\nWear masks when leaving home.",
                title: nearbyPlace.name,
                buttons: new Button({
                    title: "Let's go",
                    url: urlPlace,
                })
            }));
            conv.ask("I'll be following you here, keep me informed.");
        } else {
            conv.ask("In the meantime, I need you to follow some recommendations.\nWash your hands frequently\nKeep a minimum distance of about 2 meters from anyone coughing or sneezing\nSleep well and eat healthily\nWear masks when leaving home.");
            conv.ask("I'll be following you here, keep me informed.");
        }
    } else {
        conv.ask("Thank you for consulting me. For the moment, I'll send you some recommendations: \nWash your hands frequently\nKeep a minimum distance of about 2 meters from anyone coughing or sneezing\nDon't share personal objects\nAvoid unnecessary walking in public places\nWear masks when you leave your residence\nIf your symptoms get worse, let me know immediately");
        conv.ask("I'll be following you here, keep me informed.")
    }
    if (!conv.user.storage.dailyUpdate) {
        conv.ask('I can send you daily updates to remember to check your symptoms again. Would you like that?');
        conv.ask(new Suggestions('Yes'));
        conv.user.storage.dailyUpdate == true;
    }
});

app.intent('Register Symptoms - yes', (conv) => {
    conv.ask("Ok");
    conv.ask(new RegisterUpdate({
        intent: 'Register Symptoms',
        frequency: 'DAILY',
    }));
});

app.intent('Confirm Daily Updates Subscription', (conv, params, registered) => {
    if (registered && registered.status === 'OK') {
        conv.close(`Ok, I'll Talk about my symptoms giving you daily updates.`);
    } else {
        conv.close(`Ok, I won't give you daily updates.`);
    }
});
// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
//firebase deploy && clear && echo "Deploy realizado as" && date +%H:%M