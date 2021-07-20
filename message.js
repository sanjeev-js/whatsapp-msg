const axios = require('axios')
const fs = require('fs');
const parse = require('papaparse');

const asyncWrap = (promise) => {
    return promise.then((result) => [null, result]).catch((err) => [err]);
}

const sendMsg = async () => {
    const file = 'mobile.csv';
    const content = fs.readFileSync(file, "utf8")
    const readedFile = parse.parse(content, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => console.dir(result.data)
    }).data;

    for (i = 0; i < readedFile.length; i++) {
        console.log("STARTING WITH", i)

        const checkContact = {
            method: 'POST',
            url: "https://1201.unomok.com/v1/contacts/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.auth;
            },
            data: {
                "blocking": "wait",
                "contacts": [
                    `+${readedFile[i].mobile}`
                ],
                "force_check": false
            }
        }

        const [err, res] = await asyncWrap(axios(checkContact));
        if (err) {
            continue;
        }
        if (res) {
            console.log('contact response', res.data);
            const options = {
                method: 'POST',
                url: "https://1201.unomok.com/v1/messages/",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': process.env.auth
                },
                data: {
                    "to": readedFile[i].mobile,
                    "type": "template",
                    "template": {
                        "namespace": "7d84b42d_385e_4bc8_98fe_5641f04d0bbd",
                        "name": "udaan_2",
                        "language": {
                            "policy": "deterministic",
                            "code": "en_US"
                        },
                        "components": [
                            {
                                "type": "body",
                                "parameters": [
                                    {
                                        "type": "text",
                                        "text": `${readedFile[i].point}, https://drive.google.com/file/d/1uQDQZWyovhNj8K8NV9Ya8dLXrHd--TFT/view?usp=sharing`
                                    },
                                ]
                            }
                        ]
                    }
                },
            }
            const [error, result] = await asyncWrap(axios(options))
            if (error) {
                console.log(error);
            } else {
                console.log(result.data);
            }
        }
        console.log("Ending With", i)
    }
}

sendMsg()