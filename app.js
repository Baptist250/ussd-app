const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection setup
const pool = new Pool({
    connectionString: 'postgresql://bmi_owner:npg_Ib0gpieRF5Vv@ep-cool-moon-a8317le8-pooler.eastus2.azure.neon.tech/bmi?sslmode=require',
});

// Background DB saver
const saveBMIData = async (sessionId, phoneNumber, age, weight, height, bmi) => {
    try {
        await pool.query(
            `INSERT INTO sessions (session_id, phone_number)
             VALUES ($1, $2) ON CONFLICT (session_id) DO NOTHING`,
            [sessionId, phoneNumber]
        );

        await pool.query(
            `INSERT INTO bmi_data (session_id, age, weight, height, bmi)
             VALUES ($1, $2, $3, $4, $5)`,
            [sessionId, age, weight, height, bmi]
        );
    } catch (err) {
        console.error('Database error:', err);
    }
};

app.post('/ussd', async (req, res) => {
    res.set('Content-Type', 'text/plain');

    try {
        const { sessionId, phoneNumber, text } = req.body;
        let inputs = text.split('*');

        // Handle empty session
        if (text === '' || inputs[0] === '') {
            return res.send(`CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`);
        }

        // Handle go back
        while (inputs.includes('0')) {
            const index = inputs.lastIndexOf('0');
            if (index > 0) {
                inputs = inputs.slice(0, index); // Go back one step
            } else {
                return res.send(`CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`);
            }
        }

        const lang = inputs[0];
        let response = '';

        if (lang === '1') {
            // English Flow
            switch (inputs.length) {
                case 1:
                    response = `CON Enter your weight in KG:
0. Go back`;
                    break;
                case 2:
                    const weight = parseFloat(inputs[1]);
                    if (isNaN(weight) || weight <= 0 || weight > 300) {
                        response = `END Invalid weight. Enter a number between 1 and 300 KG.`;
                    } else {
                        response = `CON Enter your height in CM:
0. Go back`;
                    }
                    break;
                case 3:
                    const height = parseFloat(inputs[2]);
                    if (isNaN(height) || height <= 0 || height > 3000) {
                        response = `END Invalid height. Enter a number between 1 and 3000 CM.`;
                    } else {
                        response = `CON Enter your age:
0. Go back`;
                    }
                    break;
                case 4:
                    const age = parseInt(inputs[3]);
                    const w = parseFloat(inputs[1]);
                    const h = parseFloat(inputs[2]);
                    if (isNaN(age) || age <= 0 || age > 1500) {
                        response = `END Invalid age. Enter a number between 1 and 1500.`;
                    } else {
                        const bmi = w / ((h / 100) ** 2);
                        const bmiFormatted = bmi.toFixed(1);
                        let category = '';
                        if (bmi < 18.5) category = 'Underweight';
                        else if (bmi < 25) category = 'Normal weight';
                        else if (bmi < 30) category = 'Overweight';
                        else category = 'Obese';

                        saveBMIData(sessionId, phoneNumber, age, w, h, bmi);

                        response = `CON Your BMI is ${bmiFormatted} (${category}).
Do you want health tips?
1. Yes
2. No`;
                    }
                    break;
                case 5:
                    response = inputs[4] === '1'
                        ? 'END Tip: Eat balanced meals and stay active!'
                        : 'END Thank you for using our BMI service!';
                    break;
                default:
                    response = 'END Invalid input. Please try again.';
            }
        }

        else if (lang === '2') {
            // Kinyarwanda Flow
            switch (inputs.length) {
                case 1:
                    response = `CON Andika ibiro byawe (KG):
0. Subira inyuma`;
                    break;
                case 2:
                    const weight = parseFloat(inputs[1]);
                    if (isNaN(weight) || weight <= 0 || weight > 300) {
                        response = `END Ibiro si byo. Injiza hagati ya 1 na 300 KG.`;
                    } else {
                        response = `CON Andika uburebure bwawe (CM):
0. Subira inyuma`;
                    }
                    break;
                case 3:
                    const height = parseFloat(inputs[2]);
                    if (isNaN(height) || height <= 0 || height > 3000) {
                        response = `END Uburebure si bwo. Injiza hagati ya 1 na 3000 CM.`;
                    } else {
                        response = `CON Andika imyaka yawe:
0. Subira inyuma`;
                    }
                    break;
                case 4:
                    const age = parseInt(inputs[3]);
                    const w = parseFloat(inputs[1]);
                    const h = parseFloat(inputs[2]);
                    if (isNaN(age) || age <= 0 || age > 1500) {
                        response = `END Imyaka si yo. Injiza hagati ya 1 na 1500.`;
                    } else {
                        const bmi = w / ((h / 100) ** 2);
                        const bmiFormatted = bmi.toFixed(1);
                        let category = '';
                        if (bmi < 18.5) category = 'Ufite ibiro bikeya';
                        else if (bmi < 25) category = 'Ibiro bisanzwe';
                        else if (bmi < 30) category = 'Ibiro byinshi';
                        else category = 'Ufite umubyibuho ukabije';

                        saveBMIData(sessionId, phoneNumber, age, w, h, bmi);

                        response = `CON BMI yawe ni ${bmiFormatted} (${category}).
Wifuza inama z’ubuzima?
1. Yego
2. Oya`;
                    }
                    break;
                case 5:
                    response = inputs[4] === '1'
                        ? 'END Inama: Fata indyo yuzuye kandi ukore siporo buri munsi!'
                        : 'END Murakoze gukoresha serivisi yacu ya BMI.';
                    break;
                default:
                    response = 'END Ibisubizo si byo. Tangira bundi bushya.';
            }
        }

        else {
            response = `CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`;
        }

        res.send(response);

    } catch (err) {
        console.error('USSD App Error:', err);
        res.send('END Sorry, something went wrong. Please try again.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`USSD BMI app running on port ${PORT}`);
});
