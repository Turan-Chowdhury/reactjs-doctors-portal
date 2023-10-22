const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.port || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5z77za5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const appointmentCollection = client.db("doctorsPortal").collection("appointmentOptions");
        const bookingCollection = client.db("doctorsPortal").collection("bookings");
        const userCollection = client.db("doctorsPortal").collection("users");
        
        app.get('/appointmentOptions', async (req, res) => {
            const date = req.query.date;

            // get all options with all the slots
            const appointmentOptionQuery = {};
            const appointmentOptions = await appointmentCollection.find(appointmentOptionQuery).toArray();

            // get the bookings of the provided date
            const bookingQuery = { appointmentDate: date };
            const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();

            // update the option slots if there exists already bookings
            appointmentOptions.forEach(option => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === option.name);
                const optionBookedSlots = optionBooked.map(optionBook => optionBook.slot);
                const optionRemainingSlots = option.slots.filter(slot => !optionBookedSlots.includes(slot));
                option.slots = optionRemainingSlots;
            })

            res.send(appointmentOptions);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;

            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }

            const alreadyBooked = await bookingCollection.find(query).toArray();

            if (alreadyBooked.length) {
                return res.send({ acknowledged: false, message: `You already have a booking on ${booking.appointmentDate}` });
            }

            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send("Doctors portal server is running");
})

app.listen(port, () => {
    console.log(`Doctors portals is running on ${port}`);
})