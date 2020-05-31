module.exports = function prepareObj(name, value) {
    if (value == "yes" || value == "Yes")
        value = true;
    else if (value == "no" || value == "No")
        value = false;
    let diabetesData = { "name": name, "value": value };
    return diabetesData
}