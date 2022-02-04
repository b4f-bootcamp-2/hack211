import React, { useEffect, useState } from "react"
import styles from './CreateRemove.module.css'

export default function CreateRemove() {
    const [produtos, setProdutos] = useState([])
    const [add, setAdd] = useState({ nome: "", preco: 0, stock: 0, img: "", desc: "" })
    const [admins, setAdmins] = useState(["DeadDreamerTE"])
    const [editable, setEditable] = useState(false)
    const [mongo, setMongo] = useState(0)

    useEffect(() => {
        async function SendToMongo() {
            fetch("/addProdutos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(add)
            })
            setProdutos((e) => e.concat([add]))
            setAdd(() => { return { nome: "", preco: 0, stock: 0, img: "", desc: "" } })
        }
        if (mongo !== 0) {
            if (!produtos.some(e => e.nome === add.nome)) {
                SendToMongo()
            } else {
                alert("Produto já registado")
            }

        }

    }, [mongo])


    //criar backend /admins && /updateProducts
    useEffect(() => {

        async function fetchAdmins() {
            const token = localStorage.getItem("session")
            if (token) {
                const result2 = await fetch("/user", {
                    method: "GET",
                    headers: { "Authorization": token },
                })
                const json2 = await result2.json()
                const isadmin = admins.find((e) => e === json2.user)
                if (isadmin) {
                    setEditable(() => true)
                }
            }
        }
        async function fetchProdutos() {
            const result = await fetch("/produtos", {
                method: "GET",
            })
            const json = await result.json()
            setProdutos(() => json)

        }
        fetchAdmins()
        fetchProdutos()

    }, [])

    return (
        <div className={styles.mainwrapper}>

            {editable
                &&
                <div className={styles.adminmain}>

                    {produtos.length > 0 &&
                        <div className={styles.produtos}>
                            <h2>Produtos</h2>
                            <div className={styles.mainedit}>
                                {produtos.map((e, i) =>
                                    <Edit
                                        nome={e.nome}
                                        preco={e.preco}
                                        stock={e.stock}
                                        img={e.img}
                                        desc={e.desc}
                                        indice={i}
                                        setProdutos={setProdutos}
                                    />)}
                            </div>
                        </div>
                    }
                    <div className={styles.addproduct}>
                        <h2>Adicionar Produto</h2>
                        Nome <br /><input type="text" value={add.nome} onChange={(e) => setAdd(ele => { return { ...ele, nome: e.target.value } })} /><br />
                        Preço <br /><input type="number" min="0" value={add.preco} onChange={(e) => setAdd(ele => { return { ...ele, preco: parseInt(e.target.value) } })} /><br />
                        Stock <br /><input type="number" min="0" value={add.stock} onChange={(e) => setAdd(ele => { return { ...ele, stock: parseInt(e.target.value) } })} /><br />
                        Img <br /><input type="text" value={add.img} onChange={(e) => setAdd(ele => { return { ...ele, img: e.target.value } })} /><br />
                        Descrição <br /><input type="text" value={add.desc} onChange={(e) => setAdd(ele => { return { ...ele, desc: e.target.value } })} /><br />
                        <button disabled={add.nome === "" || add.preco === 0 || add.img === ""} onClick={() => setMongo(e => (e % 2) + 1)}>Submeter</button>
                    </div>
                </div>}

            <div className={styles.prod}>
                {produtos.length > 0 && produtos.sort((a, b) => b.stock - a.stock).map(e =>
                    <Produto
                        nome={e.nome}
                        preco={e.preco}
                        stock={e.stock}
                        img={e.img}
                        desc={e.desc}
                    />)}

            </div>
        </div>
    )
}

function Edit({ nome, preco, stock, img, indice, desc, setProdutos }) {
    const [stock2, setStock2] = useState(0)
    const [preco2, setPreco2] = useState(0)
    const [desc2, setDesc2] = useState("")
    const [mongo2, setMongo2] = useState(0)
    const [mongo3, setMongo3] = useState(0)

    useEffect(() => {
        function updateProducts() { //todo
            fetch("/updateProdutos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: nome, preco: preco2, stock: stock2, img: img, desc: desc2 })
            })
            setProdutos((e) => e.map((e, i) => i === indice ? { ...e, preco: preco2>0?preco2:preco, stock: stock2>0?stock2:stock, desc: desc2!==""?desc2:desc } : e))
            setStock2(()=>0)
            setPreco2(()=>0)
            setDesc2(()=>"")
        }
        if (mongo2 !== 0) {
            updateProducts()
        }

    }, [mongo2])

    useEffect(() => {
        function deleteProdutos() {
            fetch("/deleteProdutos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: nome })
            })
            setProdutos(e => e.filter((e) => e.nome !== nome))
        }
        if (mongo3 !== 0) {
            deleteProdutos()
        }
    }, [mongo3])


    return (
        <div className={styles.maineditproduct}>
            <div>
                <div>
                    <br />
                    <div style={{ textAlign: "center" }}><h2>{nome}</h2></div>
                    Preço: {preco}<br /><input type="number" min="0" value={preco2} onChange={(e) => setPreco2(() => parseInt(e.target.value))} /><br />
                    Stock: {stock}<br /><input type="number" min="0" value={stock2} onChange={(e) => setStock2(() => parseInt(e.target.value))} /><br />
                    Descrição {desc}<br /><input type="text" value={desc2} onChange={(e) => setDesc2(() => e.target.value)} /><br />
                </div>
                <div>
                    <br /><button disabled={stock2 === stock && preco2 === preco && desc2 === desc} onClick={() => setMongo2(e => (e % 2) + 1)}>Update</button>
                    <button onClick={() => setMongo3(e => (e % 2) + 1)}>X</button>
                </div>
            </div>

        </div >
    )
}

function Produto({ nome, preco, stock, img, desc }) {
    //fazer uma janela para cada produto
    return (
        <div>
            <div className={styles.img}>
                <div className={styles.imgtext}>
                    <img className={styles.actualimg} src={img} alt="" />
                    <div style={{margin:"40px", width:"200px"}}>
                        <h1>{nome}</h1>
                        <h2>{`${preco} €`}</h2>
                        <h2 style={stock>0?{color:"green"}:{color:"red"}}>{stock>0?"Em Stock":"Esgotado"}</h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

