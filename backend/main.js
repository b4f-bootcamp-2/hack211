const express = require("express")
const app = express()
const port = process.env.PORT ?? 3001

const { MongoClient, ObjectId } = require('mongodb')
const URL = process.env.MONGO_URL ?? "mongodb://localhost:27017"

let userError = undefined
let emailError = undefined
let passwordError = undefined
let passwordConfirmationError = undefined
let acceptsTermsError = undefined

let client;

const DB_NAME = "HackTon"

async function connectToMongo() {
    try {
        if (!client) {
            client = await MongoClient.connect(URL)
        }
        return client
    } catch (err) {
        console.log(err)
    }
}

function closeConnection() {
    // console.log(client)
    client?.close();
}

async function getMongoCollection(dbName, collectionName) {
    const client = await connectToMongo()
    console.log(client)
    return client.db(dbName).collection(collectionName)
}

async function createDocument(data) {
    const collection = await getMongoCollection(DB_NAME, "Users")
    const result = await collection.insertOne(data)
    console.log(result)
    return result
}

async function createSession(data) {
    const collection = await getMongoCollection(DB_NAME, "Sessions")
    const result = await collection.insertOne(data)
    console.log(result)
    return result
}

async function createProduct(data) {
    const collection = await getMongoCollection(DB_NAME, "Products")
    const result = await collection.insertOne(data)
    console.log(result)
    return result
}

async function deleteProduct(data) {
    const collection = await getMongoCollection(DB_NAME, "Products")
    const result = await collection.deleteOne({ _id: data._id })
    console.log(data._id)
    return result
}

async function updateProduct(exist, data) {
    const collection = await getMongoCollection(DB_NAME, "Products")
    const result = await collection.updateOne({ _id: exist._id }, { $set: { ...data } })
    console.log(result)
    return result
}

async function getAllProducts() {
    const collection = await getMongoCollection(DB_NAME, "Products")
    const result = await collection.find().toArray()
    console.log(result)
    return result
}

async function countDocumentEmail(email) {
    const collection = await getMongoCollection(DB_NAME, "Users")
    const result = await collection.count({ email })
    return result
}

async function findDocumentByUser(user) {
    const collection = await getMongoCollection(DB_NAME, "Users")
    const result = await collection.count({ user })
    console.log(result)
    return result
}

async function getAllUsers() {
    const collection = await getMongoCollection(DB_NAME, "Users")
    const result = await collection.find().toArray()
    console.log(result)
    return result
}

async function getAllSessions() {
    const collection = await getMongoCollection(DB_NAME, "Sessions")
    const result = await collection.find().toArray()
    return result
}

connectToMongo()

app.use(express.json())

app.post("/signup", async (req, res) => {
    const { user, email, password, passwordConfirmation, acceptsTerms, acceptsCommunications } = req.body
    let signMessage = {
        message: "Os dados introduzidos não são válidos.",
        errors: {}
    }
    if (await CheckUserErrors(user)) {
        signMessage.errors = { ...signMessage.errors, user: userError }
    }

    if (await CheckEmailErrors(email)) {
        signMessage.errors = { ...signMessage.errors, email: emailError }
    }
    if (CheckPassErrors(password)) {
        signMessage.errors = { ...signMessage.errors, password: passwordError }
    }
    if (CheckPassCErrors(password, passwordConfirmation)) {
        signMessage.errors = { ...signMessage.errors, passwordConfirmation: passwordConfirmationError }
    }
    if (CheckTermsError(acceptsTerms)) {
        signMessage.errors = { ...signMessage.errors, acceptsTerms: acceptsTermsError }
    }
    if (Object.keys(signMessage.errors).length == 0) {
        const id = new ObjectId()
        await createDocument({ _id: id, ...req.body })

        res.status(201).json({ message: "Utilizador Criado com Sucesso!", _id: id })
    } else {
        res.status(400).json(signMessage)
    }
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    const users = await getAllUsers()
    const user = users.find(e => e.email == email)
    const sessions = await getAllSessions()

    const token = new ObjectId(user._id)
    const session = sessions.find(e => e.token.toString() == token.toString())

    if (!user) {
        res.status(404).json({ message: "O utilizador não foi encontrado!" })
        return
    }
    if (user.password != password) {
        res.status(401).json({ message: "A password introduzida é inválida!" })
        return
    } if (session) {
        res.status(200).json({ token })
        return
    }
    delete user.password
    delete user.passwordConfirmation
    await createSession({ token, ...user })
    res.status(200).json({ token })

})

app.get("/user", async (req, res) => {
    const token = req.header("Authorization")
    const sessions = await getAllSessions()
    const session = sessions.find(e => e.token.toString() == token.toString())
    if (token == undefined) {
        res.status(401).json({ message: "Não foi enviado o token de autenticação!" })
        return
    }
    if (!session) {
        res.status(403).json({ message: "Não existe nenhuma sessão com o token indicado!" })
        return
    }

    res.status(200).json({ ...session })

})

app.get("/produtos", async (req, res) => {
    const products = await getAllProducts()
    res.status(200).json(products)
})

app.post("/addProdutos", async (req, res) => {
    const produto = req.body
    const produtos = await getAllProducts()
    const exist = produtos.find(e => e.nome == produto.nome)
    if (!exist) {
        await createProduct({ ...produto })
        res.status(200)
        return
    }
    res.status(400)
})

app.post("/deleteProdutos", async (req, res) => {
    const produto = req.body

    const produtos = await getAllProducts()
    const exist = produtos.find(e => e.nome == produto.nome)
    if (exist) {
        await deleteProduct(exist)
        res.status(200)
    } else {
        res.status(404)
    }
})

app.post("/updateProdutos", async (req, res) => {
    const produto = req.body
    const produtos = await getAllProducts()
    const exist = produtos.find(e => e.nome == produto.nome)
    if (exist) {
        await updateProduct(exist, produto)
        res.status(200)
    } else {
        res.status(400)
    }
})



app.listen(port, () => console.log(`À escuta em http://localhost:${port}`))


function checkPasswordStrength(password) {
    if (password.length < 8) return 0;
    const regexes = [
        /[a-z]/,
        /[A-Z]/,
        /[0-9]/,
        /[~!@#$%^&*)(+=._-]/
    ]
    return regexes
        .map(re => re.test(password))
        .reduce((score, t) => t ? score + 1 : score, 0)
}

function validateEmail(email) {
    // Esta expressão regular não garante que email existe, nem que é válido
    // No entanto deverá funcionar para a maior parte dos emails que seja necessário validar.
    const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return EMAIL_REGEX.test(email)
}

async function CheckUserErrors(user) {
    const useracc = await findDocumentByUser(user)
    if (user.length === 0) {
        userError = "Por favor introduza o seu username."
        return true
    } else if (useracc) {
        userError = "O username já está em uso!"
        return true
    }
    return false

}

async function CheckEmailErrors(email) {

    if (email.length === 0) {
        emailError = "Por favor introduza o seu endereço de email."
        return true
    } else if (!validateEmail(email)) {
        emailError = "Por favor introduza um endereço de email válido."
        return true
    } else if (await countDocumentEmail(email) > 0) {
        emailError = "O endereço introduzido já está registado."
        return true
    }
    return false

}

function CheckPassErrors(pass) {
    const passwordStrength = checkPasswordStrength(pass)
    if (pass.length === 0) {
        passwordError = "Por favor introduza a sua password."
        return true
    } else if (passwordStrength === 0) {
        passwordError = "A sua password deve ter no mínimo 8 caracteres."
        return true
    } else if (passwordStrength < 4) {
        passwordError = "A sua password deve ter pelo menos um número, uma mínuscula, uma maiúscula e um símbolo."
        return true
    }
    return false
}

function CheckPassCErrors(pass, passC) {
    if (passC.length === 0) {
        passwordConfirmationError = "Por favor introduza novamente a sua password."
        return true
    } else if (pass !== passC) {
        passwordConfirmationError = "As passwords não coincidem."
        return true
    }
    return false
}

function CheckTermsError(Terms) {

    if (Terms == false) {
        acceptsTermsError = "Tem de aceitar os termos e condições para criar a sua conta."
        return true
    }
    return false
}
