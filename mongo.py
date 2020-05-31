from pymongo import MongoClient
import random

cliente = MongoClient(
    "mongodb+srv://thiago:dYMxx3LzY0dTUUWV@maincluster-hdkzh.gcp.mongodb.net/test?retryWrites=true&w=majority")
banco = cliente["NasaHacka"]


def getAllUserData(cpf):
    col = banco["userInfo"]
    query = {"CPF": cpf}
    return col.find(query)


def getAllSymptoms(cpf):
    col = banco["userSymptoms"]
    query = {"CPF": cpf}
    return col.find(query)


def postNewData(obj):
    col = banco["test"]
    col.insert_one(obj)


cpf = "36323232839"
users = getAllUserData(cpf)
pregnancy = users[0]["Pregnancy"]
lat = users[0]["Coords"]["latitude"]
longi = users[0]["Coords"]["longitude"]
cormobity = []
for i in users[0]["Cormobity"]:
    if i["value"] == True:
        cormobity.append(1)
    else:
        cormobity.append(0)

symptoms = getAllSymptoms(cpf)
i = 0
for symp in symptoms:
    something = []
    unitSymptoms = symp["Symptoms"]
    for values in unitSymptoms:
        if(values["value"] == True):
            something.append(1)
        else:
            something.append(0)
    newObj = {
        "idnum": random.randint(0, 165781),
        "C_cardiovascular": cormobity[1],
        "C_diabetes": cormobity[0],
        "C_fumante": 0,
        "C_profissional_saude": 0,
        "C_pressao": cormobity[4],
        "C_respiratorios": cormobity[3],
        "C_imunosupress": 0,
        "C_gestante": 0,
        "C_transplante": 0,
        "C_renais": cormobity[2],
        "S_coriza": something[8],
        "S_febre": something[2],
        "S_febre_4_dias": 0,
        "S_garganta": something[1],
        "S_respiracao": something[0],
        "S_hipotensao": 0,
        "S_cansaco": something[7],
        "age": random.randint(25, 70),
        "city": "Curitiba",
        "codigo": random.randint(0, 165781),
        "POP": random.randint(0, 165781),
        "lat": lat,
        "lng": longi
    }
    something = []
    postNewData(newObj)

