var gmailSend = require('gmail-send')({});

module.exports = {
    send(account,send){

        switch(account.origin){
            case 'gmail': return this.gmailSend(account,send); break;
            case 'yahoo': return this.emulatorSend(account,send); break;
            case 'hotmail': return this.emulatorSend(account,send); break;
            case 'emulator': return this.emulatorSend(account,send); break;
            default: return null;
        }
    },

    gmailSend(account,send){
        return new Promise((resolve,reject)=>{
            send.getTemplate().then(template=>{
                    console.log('sending gmail to ', send.to.email, ' using ', account.email);
                    gmailSend({
                        user:    account.email,
                        pass:    account.password,
                        to:      send.to.email,
                        subject: template.parseSubject(send,account),
                        text:    template.parseBody(send,account)
                    },(err,res)=>{
                        if(err) reject(this.errorCauses(err));
                        else resolve(res);
                    })
            })


        });
    },



    emulatorSend(account,send){
        return new Promise((resolve,reject)=>{
            console.log('emulate mail sending to ', send.to.email, ' using ', account.email);
            setTimeout(()=>{
                if( (Date.now() / 1000 | 0) %2) 
                    resolve('emulated sending')
                else{ 
                    let error = new Error();
                    error.message = "emulated error";
                    error.cause = 'sendInstance';
                    error.code  = 100;
                    reject(error);
                }
            },2000);
        });
    },


    errorCauses(err){  // define responsible of crash
        console.log(err.message,err.code);
        switch(err.code){
            case "EENVELOPE": err.cause = 'sendInstance'; break;
            case "EAUTH": err.cause = 'accountInstance'; break;
            default: err.cause = 'unknow'; break;
        }    

        return err;
    }

};