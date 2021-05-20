const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const fileUpload = require('express-fileupload');

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());



const port = 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ooccc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


app.get('/', (req, res) => {
    res.send('hello from db');
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("creativeAgency").collection("allService");
    const orderCollection = client.db("creativeAgency").collection("order");
    const addServiceCollection = client.db("creativeAgency").collection("addService");
    const adminCollection = client.db("creativeAgency").collection("admin");

    app.post('/addReview', (req, res) => {
        const review = req.body;
        console.log(review)
        serviceCollection.insertOne(review)
        .then(result => {
            res.send(result.insertedCount > 0)
            //console.log(result)

        })
    });
    app.get('/reviews', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    });

    // app.post('/addOrder', (req, res) => {
    //     const order = req.body;
    //     orderCollection.insertOne(order)
    //     .then( result => {
    //         res.send(result.insertedOne > 0)
    //         console.log(result)
    //     })
    // });

    app.post('/addOrder', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const description = req.body.details;
        const cost = req.body.price;
        console.log(file,name,email,description, cost)
        const filePath = `${__dirname}/orders/${file.name}`;
        file.mv(filePath, err => {
            if(err){
                //console.log(err)
                return res.status(5000).send({msg: 'faild to upload image'});
            }
            return res.send({name: file.name, path:`/${file.name}`})

        })
        orderCollection.insertOne({ name, email, description,file })
        .then(result => {
            //console.log(result)
            res.send(result.insertedCount > 0)
           // console.log(result)

        })
    });

    app.get('/orders', (req, res) => {
        orderCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })

    });

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const details = req.body.description;
        
        //console.log(file,name,details)
        const filePath = `${__dirname}/service/${file.name}`;
        file.mv(filePath, err => {
            if(err){
                //console.log(err)
                return res.status(5000).send({msg: 'faild to upload image'});
            }
            return res.send({name: file.name, path:`/${file.name}`})

        })
        addServiceCollection.insertOne({ name,details,file })
        .then(result => {
            //console.log(result)
            res.send(result.insertedCount > 0)
           // console.log(result)

        })
    });

    app.post('/addAdmin', (req, res) => {
        const adminEmail = req.body;
    
        adminCollection.insertOne(adminEmail)
        .then(result => {
            res.send(result.insertedCount > 0)
            // console.log(result)

        })
    });


});

app.listen(process.env.PORT || port)

