const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(bodyparser.urlencoded({ extended: false }));

mongoose.connect(`mongodb+srv://joz:2511@butik.qrb2j.mongodb.net/QChallenge?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
const mongodb = mongoose.connection;

router.post('/',
    body('email').isEmail().normalizeEmail().notEmpty(),
    body('password').notEmpty().isLength({ min: 4 }),
    (req, res) => {
        const err = validationResult(req);
        if (!err) {
            res.send('check your Email or Password');
        }
        else {
            const password = req.body.password;
            const email = req.body.email;
            const encryptPassword = async () => {
                mongodb.collection('users').find({ email: `${email}` }).toArray((err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(data);
                    }
                })
            }
            encryptPassword();
            console.log(password, email);
            res.send('okey');
        }
    }
)

module.exports = router;