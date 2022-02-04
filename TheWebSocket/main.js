import { WebSocketServer } from 'ws';
import "isomorphic-fetch"
const wss = new WebSocketServer({ port: 8080 });

let Lobbys = new Map([]);
let LobbyTurns = new Map([]);
let wsLocation = [];
let LobbyHist = new Map([]);

let Admin = new Map([])

const password = "Batata123"

wss.on("connection", (ws) => {
    console.log("Alguém se ligou ao servidor")

    //converter ws Location para receber um token e no connect a ws tem um token, 
    //se já existir o token redirect para path=""

    ws.on("message", (data) => {
        const mensagem = JSON.parse(data)
        console.log(Object.keys(mensagem))

        if (Object.keys(mensagem).includes("Password")) {
            if (mensagem.Password === "Batata123") {
                if (mensagem.user == "DeadDreamerTE") {
                    Admin.set(mensagem.user, { user: mensagem.user, ws: ws })
                    wsLocation.push({ ws: ws, user: mensagem.user })
                }
                else {
                    const lobby = Lobbys.get(mensagem.user)

                    if (!lobby) {
                        Lobbys.set(mensagem.user, [{ user: mensagem.user, ws: ws }])
                        LobbyHist.set(mensagem.user, [])
                    }
                }
                ws.send(JSON.stringify({ valid: true }))
            }
            else {
                ws.send(JSON.stringify({ valid: false }))
            }
        }

        else if (Object.keys(mensagem).includes("text")) {
            let user
            let lobby = Lobbys.get(mensagem.user)
            if (!lobby) {
                lobby = Lobbys.get(mensagem.to)
                user = mensagem.to
            } else {
                user = mensagem.user
            }
            const websocketss = [lobby.ws].concat(Admin.get("DeadDreamerTE").ws)

            LobbyHist.set(user, LobbyHist.get(user).concat(mensagem.text))

            wss.clients.forEach(wsClients => {
                for (let logar = 0; logar < websocketss.length; logar++) {
                    if (wsClients == websocketss[logar]) {
                        wsClients.send(JSON.stringify({ user: user, hist: [mensagem.text] }))
                    }
                }
            })
        }
    })


    ws.on("close", (ws) => {
        console.log("Alguém desconectou-se")

        for (let i = 0; i < wsLocation.length; i++) {
            if (!wss.clients.has(wsLocation[i].ws)) {
                const path = wsLocation[i].user
                if (path) {
                    Lobbys.delete(path)
                    wsLocation.splice(i, 1)
                }
            }
        }
    })
})

function Acabou(winner, loser, historico) {
    fetch("http://localhost:3001/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Winner: winner, Loser: loser })
    })
    fetch("http://localhost:3001/hist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(historico)
    })
}

