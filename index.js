//const cors = require("cors") //è un meccanismo che consente ai server web di specificare chi può accedere alle risorse sul server
//const dotenv = require("dotenv") // gestisce il file .env, possiamo creare delle variabili d'ambiente lì e usarle per richiamarle
//dotenv.config() // attivo il modulo
//app.use(cors()) // abilita il middleware CORS (Cross-Origin Resource Sharing), sto consentendo ad Express di prendere richieste da origini diverse
const express = require('express')
const { PrismaClient } = require('@prisma/client') 
const path = require('path')
const app = express()
app.use(express.json())
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'mysql://root:49DOjzB73%:)@172.30.0.2:3306/prismadb',
        },
    },
})

let todos = [] // array della todolist usato anche nel lato client

const PORT = process.env.PORT // il process accede alle funzionalità in env

/*!------------- INVIA LA PAGINA HTML ---------------------- */
app.get('/', function(req,res){
    res.sendFile(path.join(__dirname, './index.html'));
})

/*!------------- VISUALIZZA IL CONTENUTO DEL DB ---------------------- */
app.get('/list', async function(req,res){
    const todos = await prisma.todo.findMany()
    res.json(todos)
})

/*!------------- RICEVE LE COSE DA FARE DELLA TODOLIST ---------------------- */
app.post('/', async function(req,res){
    const task = req.body.taskValue // qua non servono {} perhé quello che c'è da estrarre è una stringa
    const newTask = await prisma.todo.create({
        data: {
            id: todos.length + 1,
            Titolo: task,
            Completo: false,
        }
    })
    // invio la creazone del todo al client che la gestisce
    todos.push(newTask);
    res.status(201).json(newTask);
    console.log('dati arrivati')
})

/*!------------- RICERCA I DATI NELLA TABELLA TRAMITE RICHIESTA DEL CLIENT ---------------------- */
app.get("/list/:id", async (req,res) => {
    const id = req.params.id
    const todo = await prisma.todo.findUnique({ // findUnique e' una funziona che permette di ritornare solo una riga e dipende dal parametro
        where: {
            id: Number(id)
        }
    }) 
    res.json(todo) // ottengo il dato con l'id specificato
})

/*!------------- AGGIORNA I DATI NELLA TABELLA ---------------------- */
// La domanda a cui rispondere è: come prende l'id?
app.put('/list/:id', async function(req, res){
    console.log("dati modificati")
    const id = parseInt(req.params.id)  // req.params.id si riferisce a :id messo nell'URL, che gli viene passato tramite fecth
    const todo = todos.find((t) => t.id === id)
    if(!todo){
        return res.status(404).json({error: "Todo non trovato"}) // questo return vale per noi, non come risposta del server
    }
    const updateUser = await prisma.todo.update({
        where: { // stile sql, dove dover apportare la modifica
            id: todo.id
        },
        data: { // qua sara' il dato a cui vogliamo apportare modifica
            Completo: true
        } 
    })
    res.json(updateUser)
})

/*!------------- ELIMINA I DATI DALLA TABELLA DOPO AVERLI ---------------------- */
app.delete('/list/:id', async function(req, res){
    console.log("dati eliminati")
    const id = parseInt(req.params.id)  // req.params.id si riferisce a :id messo nell'URL, che gli viene passato tramite fecth
    const index = todos.findIndex((t) => t.id === id) // ci serve ora eliminare l'indice
    if (index === -1) {
        return res.status(404).json({ error: "Todo not found" });
    }
    const deleteTodo = await prisma.todo.delete({ // ora creiamo la variabile che rappresenta l'utente da eliminare
        where: {
            id: Number(id) // specifichiamo che non e' una stringa ma un numero, perche' quando passi variabili nei parametri (/:id) prende essi come stringhe
        }
    }) 
    todos.splice(index, 1);
    res.json(deleteTodo)
})


/*!------------- INVIO I COLORI ---------------------- */
app.get('/colors', async function(req, res){
    const colori = {
        red: process.env.RED,
        yellow: process.env.YELLOW,
        acqua: process.env.ACQUA
    }
    res.json(colori)
})

app.listen(PORT, () =>{
    console.log(`SERVER IN ESECUZIONE SULLA PORTA ${PORT}`)
})