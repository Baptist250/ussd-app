const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection setup
const pool = new Pool({
    connectionString: 'postgresql://bmi_owner:npg_Ib0gpieRF5Vv@ep-cool-moon-a8317le8-pooler.eastus2.azure.neon.tech/bmi?sslmode=require',
});

app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const inputs = text.split('*');
    let response = '';
    if (text === '') {
        response = `CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`;
    }
    else if (inputs[0] === '1') {
        if (inputs.length === 1) {
            response = `CON Enter your weight in KG:
0. Go back`;
        } else if (inputs.length === 2) {
            if (inputs[1] === '0') {
                response = `CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`;
            } else {
                const weight = parseFloat(inputs[1]);
                if (isNaN(weight) || weight <= 0 || weight > 300) {
                    response = `END Invalid weight. Please enter a number between 1 and 300 KG.`;
                } else {
                    response = `CON Enter your height in CM:
0. Go back`;
                }
            }
        } else if (inputs.length === 3) {
            if (inputs[2] === '0') {
                response = `CON Enter your weight in KG:
0. Go back`;
            } else {
                const height = parseFloat(inputs[2]);
                if (isNaN(height) || height <= 0 || height > 3000) {
                    response = `END Invalid height. Please enter a number between 1 and 3000 CM.`;
                } else {
                    response = `CON Enter your age:
0. Go back`;
                }
            }
        } else if (inputs.length === 4) {
            if (inputs[3] === '0') {
                response = `CON Enter your height in CM:
0. Go back`;
            } else {
                const weight = parseFloat(inputs[1]);
                const height_cm = parseFloat(inputs[2]);
                const age = parseInt(inputs[3]);

                if (isNaN(age) || age <= 0 || age > 1500) {
                    response = `END Invalid age. Please enter a number between 1 and 1500.`;
                } else {
                    const height_m = height_cm / 100;
                    const bmi = weight / (height_m * height_m);
                    const bmiFormatted = bmi.toFixed(1);

                    let category = '';
                    if (bmi < 18.5) category = 'Underweight';
                    else if (bmi < 25) category = 'Normal weight';
                    else if (bmi < 30) category = 'Overweight';
                    else category = 'Obese';

                    (async () => {
                        try {
                            await pool.query(
                                `INSERT INTO sessions (session_id, phone_number)
                                 VALUES ($1, $2) ON CONFLICT (session_id) DO NOTHING`,
                                [sessionId, phoneNumber]
                            );

                            await pool.query(
                                `INSERT INTO bmi_data (session_id, age, weight, height, bmi)
                                 VALUES ($1, $2, $3, $4, $5)`,
                                [sessionId, age, weight, height_cm, bmi]
                            );
                        } catch (err) {
                            console.error('DB Error:', err);
                        }
                    })();

                    response = `CON Your BMI is ${bmiFormatted} (${category}).
Do you want health tips?
1. Yes
2. No`;
                }
            }
        } else if (inputs.length === 5) {
            response = inputs[4] === '1'
                ? 'END Tip: Eat balanced meals and stay active daily!'
                : 'END Thank you for using our BMI service!';
        }
    }

    else if (inputs[0] === '2') {
        if (inputs.length === 1) {
            response = `CON Andika ibiro byawe (KG):
0. Subira inyuma`;
        } else if (inputs.length === 2) {
            if (inputs[1] === '0') {
                response = `CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`;
            } else {
                const weight = parseFloat(inputs[1]);
                if (isNaN(weight) || weight <= 0 || weight > 300) {
                    response = `END Ibiro si byo. Injiza hagati ya 1 na 300 KG.`;
                } else {
                    response = `CON Andika uburebure bwawe (CM):
0. Subira inyuma`;
                }
            }
        } else if (inputs.length === 3) {
            if (inputs[2] === '0') {
                response = `CON Andika ibiro byawe (KG):
0. Subira inyuma`;
            } else {
                const height = parseFloat(inputs[2]);
                if (isNaN(height) || height <= 0 || height > 3000) {
                    response = `END Uburebure si bwo. Injiza hagati ya 1 na 3000 CM.`;
                } else {
                    response = `CON Andika imyaka yawe:
0. Subira inyuma`;
                }
            }
        } else if (inputs.length === 4) {
            if (inputs[3] === '0') {
                response = `CON Andika uburebure bwawe (CM):
0. Subira inyuma`;
            } else {
                const weight = parseFloat(inputs[1]);
                const height_cm = parseFloat(inputs[2]);
                const age = parseInt(inputs[3]);

                if (isNaN(age) || age <= 0 || age > 1500) {
                    response = `END Imyaka si yo. Injiza hagati ya 1 na 1500.`;
                } else {
                    const height_m = height_cm / 100;
                    const bmi = weight / (height_m * height_m);
                    const bmiFormatted = bmi.toFixed(1);

                    let category = '';
                    if (bmi < 18.5) category = 'Ufite ibiro bikeya';
                    else if (bmi < 25) category = 'Ibiro bisanzwe';
                    else if (bmi < 30) category = 'Ibiro byinshi';
                    else category = 'Ufite umubyibuho ukabije';

                    (async () => {
                        try {
                            await pool.query(
                                `INSERT INTO sessions (session_id, phone_number)
                                 VALUES ($1, $2) ON CONFLICT (session_id) DO NOTHING`,
                                [sessionId, phoneNumber]
                            );

                            await pool.query(
                                `INSERT INTO bmi_data (session_id, age, weight, height, bmi)
                                 VALUES ($1, $2, $3, $4, $5)`,
                                [sessionId, age, weight, height_cm, bmi]
                            );
                        } catch (err) {
                            console.error('DB Error:', err);
                        }
                    })();

                    response = `CON BMI yawe ni ${bmiFormatted} (${category}).
Wifuza inama z’ubuzima?
1. Yego
2. Oya`;
                }
            }
        } else if (inputs.length === 5) {
            response = inputs[4] === '1'
                ? 'END Inama: Fata indyo yuzuye kandi ukore siporo buri munsi!'
                : 'END Murakoze gukoresha serivisi yacu ya BMI.';
        }
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`USSD BMI app running on port ${PORT}`);
});
