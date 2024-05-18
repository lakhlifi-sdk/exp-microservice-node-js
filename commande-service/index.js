const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4001;
const mongoose = require("mongoose");
const Commande = require("./Commande");
const axios = require('axios');
const isAuthenticated = require("./isAuthenticated")

//Connexion à la base de données
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost/commande-service",{
    useNewUrlParser: true,
},
).then(()=>{
    console.log("connected")
}).catch((err=>{
    console.log(err)
}));
app.use(express.json());
//Calcul du prix total d'une commande en passant en paramètre un tableau des produits
function prixTotal(produits) {
    let total = 0;
    for (let t = 0; t < produits.length; ++t) {
        total += produits[t].prix;
    }
    return total;
}

async function httpRequest(ids) {
    try {
        const URL = "http://localhost:4000/produit/acheter";
        const response = await axios.get(URL, {
            data: { ids: ids }, // Les paramètres sont passés ici dans un objet 'data'
            headers: {
                'Content-Type': 'application/json'
            }
        });
        //appel de la fonction prixTotal pour calculer le prix total de la commande en se basant sur le résultat de la requête http
        return prixTotal(response.data);
    } catch (error) {
        console.error(error);
    }
}
app.post("/commande/ajouter", isAuthenticated, async (req, res, next) => {
    // Création d'une nouvelle commande dans la collection commande 
    const email_utilisateur  = req.body.email_utilisateur;
    const produits = req.body.ids;
    console.log("body ------>", req.body)
    httpRequest(req.body.ids).then(total => {
        const newCommande = new Commande({
            produits,
            email_utilisateur: email_utilisateur,
            prix_total: total,
        });
        newCommande.save()
            .then(commande => res.status(201).json(commande))
            .catch(error => res.status(400).json({ error }));
    });
});

app.get("/",(req,res)=>{
    res.json({"message": "welcome to commande service"})
})


app.listen(PORT, () => {
    console.log(`Commande-Service at ${PORT}`);
});
