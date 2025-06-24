const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection setup
const pool = new Pool({
    connectionString: 'postgresql://bmi_owner:npg_Ib0gpieRF5Vv@ep-cool-moon-a8317le8-pooler.eastus2.azure.neon.tech/bmi?sslmode=require',
});

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
        const inputs = text.split('*');
        let response = '';

        // Reset or first time
        if (text === '' || inputs.length === 0) {
            return res.send(`CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`);
        }

        // If user pressed 0, remove last step and go back
        const cleanInputs = [...inputs];
        while (cleanInputs.includes('0')) {
            const index = cleanInputs.lastIndexOf('0');
            cleanInputs.splice(index, 1);
        }

        const lang = cleanInputs[0];

        if (lang === '1') {
            // English Flow
            switch (cleanInputs.length) {
                case 1:
                    response = `CON Enter your weight in KG:
0. Go back`;
                    break;
                case 2:
                    const weight1 = parseFloat(cleanInputs[1]);
                    if (isNaN(weight1) || weight1 <= 0 || weight1 > 300) {
                        response = `END Invalid weight. Please enter a number between 1 and 300 KG.`;
                    } else {
                        response = `CON Enter your height in CM:
0. Go back`;
                    }
                    break;
                case 3:
                    const height1 = parseFloat(cleanInputs[2]);
                    if (isNaN(height1) || height1 <= 0 || height1 > 3000) {
                        response = `END Invalid height. Please enter a number between 1 and 3000 CM.`;
                    } else {
                        response = `CON Enter your age:
0. Go back`;
                    }
                    break;
                case 4:
                    const weight2 = parseFloat(cleanInputs[1]);
                    const height_cm1 = parseFloat(cleanInputs[2]);
                    const age1 = parseInt(cleanInputs[3]);

                    if (isNaN(age1) || age1 <= 0 || age1 > 1500) {
                        response = `END Invalid age. Please enter a number between 1 and 1500.`;
                    } else {
                        const height_m1 = height_cm1 / 100;
                        const bmi1 = weight2 / (height_m1 * height_m1);
                        const bmiFormatted1 = bmi1.toFixed(1);

                        let category = '';
                        if (bmi1 < 18.5) category = 'Underweight';
                        else if (bmi1 < 25) category = 'Normal weight';
                        else if (bmi1 < 30) category = 'Overweight';
                        else category = 'Obese';

                        saveBMIData(sessionId, phoneNumber, age1, weight2, height_cm1, bmi1);

                        response = `CON Your BMI is ${bmiFormatted1} (${category}).
Do you want health tips?
1. Yes
2. No`;
                    }
                    break;
                case 5:
                    response = cleanInputs[4] === '1'
                        ? 'END Tip: Eat balanced meals and stay active daily!'
                        : 'END Thank you for using our BMI service!';
                    break;
                default:
                    response = 'END Invalid input. Start again.';
            }
        } else if (lang === '2') {
            // Kinyarwanda Flow
            switch (cleanInputs.length) {
                case 1:
                    response = `CON Andika ibiro byawe (KG):
0. Subira inyuma`;
                    break;
                case 2:
                    const weight3 = parseFloat(cleanInputs[1]);
                    if (isNaN(weight3) || weight3 <= 0 || weight3 > 300) {
                        response = `END Ibiro si byo. Injiza hagati ya 1 na 300 KG.`;
                    } else {
                        response = `CON Andika uburebure bwawe (CM):
0. Subira inyuma`;
                    }
                    break;
                case 3:
                    const height2 = parseFloat(cleanInputs[2]);
                    if (isNaN(height2) || height2 <= 0 || height2 > 3000) {
                        response = `END Uburebure si bwo. Injiza hagati ya 1 na 3000 CM.`;
                    } else {
                        response = `CON Andika imyaka yawe:
0. Subira inyuma`;
                    }
                    break;
                case 4:
                    const weight4 = parseFloat(cleanInputs[1]);
                    const height_cm2 = parseFloat(cleanInputs[2]);
                    const age2 = parseInt(cleanInputs[3]);

                    if (isNaN(age2) || age2 <= 0 || age2 > 1500) {
                        response = `END Imyaka si yo. Injiza hagati ya 1 na 1500.`;
                    } else {
                        const height_m2 = height_cm2 / 100;
                        const bmi2 = weight4 / (height_m2 * height_m2);
                        const bmiFormatted2 = bmi2.toFixed(1);

                        let category = '';
                        if (bmi2 < 18.5) category = 'Ufite ibiro bikeya';
                        else if (bmi2 < 25) category = 'Ibiro bisanzwe';
                        else if (bmi2 < 30) category = 'Ibiro byinshi';
                        else category = 'Ufite umubyibuho ukabije';

                        saveBMIData(sessionId, phoneNumber, age2, weight4, height_cm2, bmi2);

                        response = `CON BMI yawe ni ${bmiFormatted2} (${category}).
Wifuza inama z’ubuzima?
1. Yego
2. Oya`;
                    }
                    break;
                case 5:
                    response = cleanInputs[4] === '1'
                        ? 'END Inama: Fata indyo yuzuye kandi ukore siporo buri munsi!'
                        : 'END Murakoze gukoresha serivisi yacu ya BMI.';
                    break;
                default:
                    response = 'END Ibisubizo si byo. Tangira bundi bushya.';
            }
        } else {
            response = `CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`;
        }

        res.send(response);
    } catch (err) {
        console.error('USSD App Error:', err);
        res.send('END Sorry, something went wrong. Please try again later.');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`USSD BMI app running on port ${PORT}`);
});
