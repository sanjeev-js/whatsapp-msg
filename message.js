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
            url: "url/v1/contacts/",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer token"
            },
            data: {
                "blocking": "wait",
                "contacts": [
                    `+91${readedFile[i].mobile}`
                ],
                "force_check": false
            }
        }

        const [err, res] = await asyncWrap(axios(checkContact));
        if (res) {
            console.log(res.data)
            const options = {
                method: 'POST',
                url: "url/v1/messages/",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer token"
                },
                data: {
                    "to": `91${readedFile[i].mobile}`,
                    "type": "template",
                    "template": {
                        "namespace": "namespace",
                        "name": "template name",
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
                                        "text": `${readedFile[i].amount}`
                                    },
                                    {
                                      "type" :"text",
                                      "text" :`${readedFile[i].id}`
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
    }
    console.log("Ending With", i)
    // }
}

sendMsg()
