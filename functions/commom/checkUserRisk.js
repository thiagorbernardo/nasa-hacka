const { AgeFromDateString } = require('age-calculator');
module.exports = async function checkUserRisk(symptoms, comorbity, birthDate) {
    birthDate = birthDate.slice(0, 10);
    let ageFromString = new AgeFromDateString(birthDate).age;
    console.log("Age", ageFromString);
    let howManyTrueCormobity = 0;
    let yellowSymptoms = 0;
    let greenSymptoms = 0;
    let redSymptoms = false;
    const severalYellowSymptoms = ["Breathing", "Fever", "Cough"];
    const severalGreenSymptoms = ["Throat", "MuscleAsches", "Nasal"];
    for (var i = 0; i < comorbity.length; i++) {
        if (comorbity[i].value == true) {
            howManyTrueCormobity++;
        }
    }
    for (var i = 0; i < symptoms.length; i++) {
        if ((severalYellowSymptoms.find(el => el == symptoms[i].name) != undefined) && symptoms[i].value == true) {
            yellowSymptoms++;
            if(symptoms[i].name == "Breathing" && symptoms[i].name == "Fever")
                redSymptoms == true;
        } else if ((severalGreenSymptoms.find(el => el == symptoms[i].name) != undefined) && symptoms[i].value == true) {
            greenSymptoms++;
        }
    }
    if (((howManyTrueCormobity >= 1 && (yellowSymptoms >= 1 || age > 60)) || (yellowSymptoms == 3)) || (redSymptoms) )
        return 3;
    else if (yellowSymptoms >= 2)
        return 2;
    else if (greenSymptoms >= 1)
        return 1;
    else
        return 0;
}