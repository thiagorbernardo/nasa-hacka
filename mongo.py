from pymongo import MongoClient

obj = {
    "name": "sasd",
    "age": 23
}

cliente = MongoClient(
    "mongodb+srv://thiago:dYMxx3LzY0dTUUWV@maincluster-hdkzh.gcp.mongodb.net/test?retryWrites=true&w=majority")
banco = cliente["NasaHacka"]
album = banco["userInfo"]

album.insert_one(obj)
