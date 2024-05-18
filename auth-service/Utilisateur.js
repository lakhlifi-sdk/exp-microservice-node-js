const mongoose = require("mongoose");

const UtilisateurSchema = mongoose.Schema({
    name: String,
    mail: String,
    password: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});
module.exports = Utilisateur = mongoose.model("utilisateur", UtilisateurSchema);

