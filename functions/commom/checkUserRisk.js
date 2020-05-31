const { AgeFromDateString } = require('age-calculator');
module.exports = async function checkUserRisk(symptoms, comorbity, birthDate) {
    birthDate = birthDate.slice(0, 10);
    let ageFromString = new AgeFromDateString(birthDate).age;
    console.log("Age", ageFromString);
    let howManyTrueCormobity = 0;
    let howManyTrueSymptoms = 0;
    const severalSymptoms = ["Breathing", "Fever", "Cough"];
    for (var i = 0; i < comorbity.length; i++) {
        if (comorbity[i].value == true) {
            howManyTrueCormobity++;
        }
    }
    for (var i = 0; i < symptoms.length; i++) {
        if ((severalSymptoms.find(el => el == symptoms[i].name) != undefined) && symptoms[i].value == true) {
            howManyTrueSymptoms++;
        }
    }
    if ((howManyTrueCormobity >= 1 && (howManyTrueSymptoms >= 1 || age > 60)) || (howManyTrueSymptoms == 3))
        console.log("High Risk, I recommend strongly that you go to a hospital")
    console.log(howManyTrueCormobity)
    console.log(howManyTrueSymptoms)
}