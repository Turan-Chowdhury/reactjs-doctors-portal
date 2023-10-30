const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const mg = require('nodemailer-mailgun-transport');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.port || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5z77za5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const sendBookingEmail = (booking) => {

    const { email, treatment, appointmentDate, slot } = booking;

    // USING MAIL GUN

    const auth = {
        auth: {
          api_key: process.env.EMAIL_SEND_KEY,
          domain: process.env.EMAIL_SEND_DOMAIN
        }
    } 
    
    const transporter = nodemailer.createTransport(mg(auth));
   
    // USING SEND GRID

    // let transporter = nodemailer.createTransport({
    //     host: 'smtp.sendgrid.net',
    //     port: 587,
    //     auth: {
    //         user: "apikey",
    //         pass: process.env.SENDGRID_API_KEY
    //     }
    // });
    
    transporter.sendMail({
        from: "turanchowdhury01@gmail.com", // verified sender email
        to: email || 'turanchowdhury01@gmail.com', // recipient email
        subject: `Your appointment for ${treatment} is confirmed`, // Subject line
        text: "Hello world!", // plain text body
        html: `
            <h3>Your appointment is confirmed</h3>
            <div>
                <p>Your appointment for treatment: ${treatment}</p>
                <p>Please visit us on ${appointmentDate} at ${slot}</p>
                <p>Thanks from Doctors Portal.</p>
            </div>        
        `, // html body
    }, function (error, info) {
        if (error) {
            console.log('Email send error', error);
        } else {
            console.log('Email sent: ' + info);
        }
    });

}

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        const appointmentCollection = client.db("doctorsPortal").collection("appointmentOptions");
        const bookingCollection = client.db("doctorsPortal").collection("bookings");
        const userCollection = client.db("doctorsPortal").collection("users");
        const doctorCollection = client.db("doctorsPortal").collection("doctors");
        const paymentCollection = client.db("doctorsPortal").collection("payments");

        // NOTE: make sure to use verifyAdmin after verifyJWT
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await userCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' });
            }
            next();
        }

        app.get('/jwt', async (req, res) => {   
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' });
        })
        
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

        // optional
        app.get('/v2/appointmentOptions', async (req, res) => {
            const date = req.query.date;

            const appointmentOptions = await appointmentCollection.aggregate([
                {
                    $lookup: {
                        from: 'bookings',
                        localField: 'name',
                        foreignField: 'treatment',
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$appointmentDate', date]
                                    }
                                }
                            }
                        ],
                        as: 'booked'
                    }
                },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        slots: 1,
                        booked: {
                            $map: {
                                input: '$booked',
                                as: 'book',
                                in: '$$book.slot'
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: 1,
                        price: 1,
                        slots: {
                            $setDifference: ['$slots', '$booked']
                        }
                    }
                }
            ]).toArray();

            res.send(appointmentOptions);
        })

        app.get('/appointmentSpecialty', async (req, res) => {
            const query = {};
            const result = await appointmentCollection.find(query).project({ name: 1 }).toArray();
            res.send(result);
        })

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (decodedEmail !== email) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email };
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        })

        app.get('/bookings/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const booking = await bookingCollection.findOne(query);
            res.send(booking);
        })

        app.post('/bookings', verifyJWT, async (req, res) => {
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

            // send email about appointment confirmation
            sendBookingEmail(booking);

            res.send(result);
        })

        app.post("/create-payment-intent", verifyJWT, async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100; 
          
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                ],
            });
          
            res.send({ clientSecret: paymentIntent.client_secret });
        });

        app.post('/payments', verifyJWT, async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            query = { email: user.email };
            const userAlreadyAdded = await userCollection.findOne(query);
            if (userAlreadyAdded) {
                return res.send({userAlreadyAdded: true });
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.delete('/users/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {         
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const option = { upsert: true };
            const result = await userCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        })

        // temporary api to update price field on appointment options
        // app.get('/add-price', async (req, res) => {
        //     const filter = {};
        //     const updatedDoc = {
        //         $set: {
        //             price: 99
        //         }
        //     }
        //     const options = { upsert: true };
        //     const result = await appointmentCollection.updateMany(filter, updatedDoc, options);
        //     res.send(result);
        // })

        app.get('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
            const query = {};
            const doctors = await doctorCollection.find(query).toArray();
            res.send(doctors);
        })

        app.post('/doctors', verifyJWT, verifyAdmin, async (req, res) => {
            const doctor = req.body;
            const result = await doctorCollection.insertOne(doctor);
            res.send(result);
        })

        app.delete('/doctors/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await doctorCollection.deleteOne(filter);
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