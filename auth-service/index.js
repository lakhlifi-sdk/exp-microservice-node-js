const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4002;
const mongoose = require("mongoose");
const Utilisateur = require("./Utilisateur");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

mongoose.set('strictQuery', true);
mongoose.connect(
    "mongodb://localhost/auth-service",
    {
        useNewUrlParser: true,
    }
).then(()=>{
    console.log("Db connected")
}).catch(err=>{
    console.log(err)
});

app.use(express.json());
// la méthode regiter permettera de créer et d'ajouter un nouvel utilisateur à la base de données
app.post("/auth/register", async (req, res)=>{
    const { name, mail, password } = req.body
    const isUserExist = await  Utilisateur.findOne({ mail });
    if(isUserExist){
       res.json({"message": "user exist"})
    }else{

        bcrypt.hash(password,10, (err,hash)=>{
            if(err){
                res.status(500).json({"message": "Server error"})
            }else{
                const newUser = new Utilisateur({name : name,mail:mail,password:hash})
                newUser.save().then(()=>{
                    res.json({
                        "message": "user saved succefully"
                    }).catch(err => {
                        console.log(err)
                    })
                })
            }
        })   
    }
})

app.post("/auth/login",async(req, res)=>{
    const {mail, password} = req.body

    const user = await Utilisateur.findOne({mail})
    if(user){
        bcrypt.compare(password,user.password).then(result=>{
            if(result){
                const payload = {
                    mail:mail,
                    name: user.name
                };

                jwt.sign(payload,"secret", (err, token)=>{
                    if(err){
                        console.log(err)
                    }else{
                        res.json({token: token})
                    }
                })

            }else{
                res.status(400).json({message:"invalid auth"})
            }

        })
       
    } else {
        res.status(400).json({"message":"invalid auth"})
    }
})

app.listen(PORT,()=>{
    console.log(`listen on port ${PORT}`)
})

