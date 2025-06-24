const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const inputs = text.split('*');

    let response = '';

    if (text === '') {
        response = `CON Please choose language / Hitamo ururimi
1. English
2. Kinyarwanda`;
    }

    // English Flow
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
                response = `CON Enter your height in CM:
0. Go back`;
            }
        } else if (inputs.length === 3) {
            if (inputs[2] === '0') {
                response = `CON Enter your weight in KG:
0. Go back`;
            } else {
                const weight = parseFloat(inputs[1]);
                const height_cm = parseFloat(inputs[2]);
                const height_m = height_cm / 100;
                const bmi = weight / (height_m * height_m);
                const bmiFormatted = bmi.toFixed(1);

                let category = '';
                if (bmi < 18.5) category = 'Underweight';
                else if (bmi < 25) category = 'Normal weight';
                else if (bmi < 30) category = 'Overweight';
                else category = 'Obese';

                response = `CON Your BMI is ${bmiFormatted} (${category}).
Do you want health tips?
1. Yes
2. No`;
            }
        } else if (inputs.length === 4) {
            if (inputs[3] === '1') {
                response = 'END Tip: Eat balanced meals and stay active daily!';
            } else {
                response = 'END Thank you for using our BMI service!';
            }
        }
    }

    // Kinyarwanda Flow
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
                response = `CON Andika uburebure bwawe (CM):
0. Subira inyuma`;
            }
        } else if (inputs.length === 3) {
            if (inputs[2] === '0') {
                response = `CON Andika ibiro byawe (KG):
0. Subira inyuma`;
            } else {
                const weight = parseFloat(inputs[1]);
                const height_cm = parseFloat(inputs[2]);
                const height_m = height_cm / 100;
                const bmi = weight / (height_m * height_m);
                const bmiFormatted = bmi.toFixed(1);

                let category = '';
                if (bmi < 18.5) category = 'Ufite ibiro bikeya';
                else if (bmi < 25) category = 'Ibiro bisanzwe';
                else if (bmi < 30) category = 'Ibiro byinshi';
                else category = 'Ufite umubyibuho ukabije';

                response = `CON BMI yawe ni ${bmiFormatted} (${category}).
Wifuza inama z’ubuzima?
1. Yego
2. Oya`;
            }
        } else if (inputs.length === 4) {
            if (inputs[3] === '1') {
                response = 'END Inama: Fata indyo yuzuye kandi ukore siporo buri munsi!';
            } else {
                response = 'END Murakoze gukoresha serivisi yacu ya BMI.';
            }
        }
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`USSD BMI app running on port ${PORT}`);
});
