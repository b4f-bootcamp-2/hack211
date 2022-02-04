import { useEffect, useState } from "react"

let ws
const admins = ["DeadDreamerTE"]
export default function TheWebSocket() {
    const [admin, setAdmin] = useState(false)
    const [hist, setHist] = useState([])
    const [to, setTo] = useState("")
    const [user, setUser] = useState("")
    const [perm, setPerm] = useState(false)

    useEffect(() => {
        async function setup() {
            const token = localStorage.getItem("session")
            if (!token) {
                window.location.pathname = "/login"
            }
            if (token) {
                const result2 = await fetch("/user", {
                    method: "GET",
                    headers: { "Authorization": token },
                })
                const json2 = await result2.json()
                setUser(() => json2.user)
                const isadmin = admins.find((e) => e === json2.user)
                if (isadmin) {
                    setAdmin(() => true)
                } else {
                    setTo(() => "DeadDreamerTE")
                }
            }
        } setup()
    }, [])

    useEffect(() => {
        if (user != "") {
            setTimeout(() => {
                ws = new WebSocket('ws://localhost:8080')
                ws.addEventListener("open", (ev) => {
                    ws.addEventListener("message", (ev) => {
                        console.log(`A mensagem é : ${ev.data}`)

                        if (Object.keys(JSON.parse(ev.data)).includes("valid")) {
                            const validade = JSON.parse(ev.data)
                            if (!validade) {
                                alert(`Password Incorreta!`)
                            } else {
                                setPerm(() => true)
                            }
                        }

                        if (Object.keys(JSON.parse(ev.data)).includes("hist")) {
                            const mensagem = JSON.parse(ev.data)

                        }
                    })
                    ws.send(JSON.stringify({ Tabuleiro: Tabuleiro.Tabuleiro, user: Tabuleiro.Player, V: Tabuleiro.V, D: Tabuleiro.D, path: window.location.pathname }))
                })


            }, 5000)
        }


    }, [user])

    useEffect(() => {
        if (jogada != "") {
            setTurn(() => "a")
            ws.send(jogada)
        }
    }, [jogada])

    return (<div>
        {turn == "" && <div>
            <p>Looking for a enemy...</p>
        </div>}

        {turn != "" && <div>
            <section className="Jogo">

                <div>
                    <p><span>{Tabuleiro.Player}</span></p>
                    <table className="TabuleiroB" style={(turn == Tabuleiro.Player && turn != "") ? { boxShadow: "0px 0px 2px 2px grey" } : {}}>
                        <tbody>{Tabuleiro.Tabuleiro.map((l, i) => (
                            <tr key={i}>
                                {l.map((c, j) => (
                                    <td style={TabStyle(c)} key={j}></td>))}
                            </tr>))}
                        </tbody>
                    </table>

                    <p>V: <span>{Tabuleiro.V}</span>   D:<span>{Tabuleiro.D}</span></p>
                    <div className="controls">
                        <button style={{ backgroundColor: "rgb(255, 30, 30)" }} onClick={() => window.location.pathname = ""}>Desistir</button>
                    </div>
                </div>

                <div>
                    <p><span>{enemy.Player}</span></p>
                    <table className="TabuleiroR" style={(turn != Tabuleiro.Player && turn != "") ? { boxShadow: "0px 0px 2px 2px grey" } : {}}>
                        <tbody>{enemy.Tabuleiro.map((l, i) => (
                            <tr key={i}>
                                {l.map((c, j) => (
                                    <td onClick={() => {
                                        if (turn == Tabuleiro.Player && c === "" && jogada == "") {
                                            setJogada(() => JSON.stringify({ i: i, j: j, path: window.location.pathname, user: Tabuleiro.Player }))
                                        }
                                    }} style={AdvStyle(c)} key={j}></td>))}
                            </tr>))}
                        </tbody>
                    </table>

                    <p>V: <span>{enemy.V}</span>   D:<span>{enemy.D}</span></p>
                </div>


            </section>
            <div className="chat" >
                {hist.map((e, i) => <p key={i} style={e.includes(Tabuleiro.Player) ? { color: "rgb(127, 197, 220)", paddingBottom: "10px" } : { color: "rgb(255, 82, 84)", paddingBottom: "20px" }}>{e}</p>)}
            </div>
        </div >}
    </div >
    );
}
