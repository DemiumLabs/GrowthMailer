'use strict';
const realuserMailer = require('../../lib/realuser-mailer');

const MINIMUM_AVAILABILITY_TIME = 15 * 60 * 1000;  // 15 minutes in miliseconds 
const MAXIMUM_RESERVATION_TIME  =  2 * 1000; // 2 second
const MAXIMUM_BUSY_TIME  =  60 * 1000; // 60 seconds


module.exports = function(Account) {

    Account.prototype.remoteSend = function(sendId,reservationToken){
        return new Promise((resolve,reject)=>{
            if (this.reservationToken == reservationToken)
                Account.app.models.Send.findById(sendId)
                    .then(sendInstance=>{
                        if(sendInstance)
                            if(sendInstance.state == 'pending')
                                    
                            {      
                                 //   sendInstance.to.email = 'audrey@passporterapp.com';  //@DEVELOP FIXTURE
                                    this.send(sendInstance)
                                        .then(resolve)
                                        .catch(reject)
                            }

                            else reject('send instance is not pending')
                        else reject('send instance not found');
                    })
                    .catch(reject)
            else reject('reservation token is not valid')
        })
    }


    Account.prototype.send = function(sendInstance){
        this.busy();
        return new Promise((resolve,reject)=>{
            realuserMailer
                .send(this,sendInstance)
                    .then((mailerResponse)=>{
                        Promise.all([
                                        sendInstance.sendSuccess(mailerResponse,this),
                                        this.sendSuccess()
                                    ])
                                .then(resolve)
                                .catch(reject)
                    })
                    .catch((error)=>{
                        if(error.cause == 'sendInstance') sendInstance.setCrash(error); 
                        else sendInstance.retry();

                        // let solvedPromise = (error.cause == 'accountInstance') ? 
                        //     this.setCrash(error) : 
                        //     this.unlock();

                        this.setCrash(error);

                        solvedPromise
                            .then(()=>reject(error))
                            .catch(reject);
                    });
        });
    }


    Account.prototype.setCrash = function(error){
        this.state = "error";
        this.error = error;
        return this.save();
    }


    Account.prototype.sendSuccess = function(){
        this.state = "available";
        this.lastSend = new Date();
        return this.save();
    }


    Account.prototype.unlock = function(){
        this.state = "available";
        this.error = null;
        return this.save();
    }

    Account.prototype.busy = function(){
        this.state = "busy";
        return this.save();
    }

    Account.getAvailable = () => {

        let availableCondition = { 
                                    and:[
                                        { state: 'available' },
                                        { or: [
                                                {lastSend: {eq: null} },    
                                                {lastSend: {lt: Date.now() - MINIMUM_AVAILABILITY_TIME}}
                                            ]  
                                        }
                                    ]
                                };
        let reservedCaducedCondition = { 
                                            and:[
                                                { state: 'reserved' },
                                                { reservatedAt: {lt: Date.now() - MAXIMUM_RESERVATION_TIME }}
                                            ]
                                        }

        let busyTooTimeCondition = { 
                                        and:[
                                            { state: 'busy' },
                                            { updatedAt: {lt: Date.now() - MAXIMUM_BUSY_TIME }}
                                        ]
                                    }                                

        let filter = { 
                        where: {
                            or: [
                                 availableCondition,
                                 reservedCaducedCondition,
                                 busyTooTimeCondition
                            ]
                        }
                     }
                    //  console.log(JSON.stringify(filter));
        return Account.findOne(filter)
    }


    Account.available = () => {
        return new Promise((resolve,reject) =>{
            Account.getAvailable()
            .then(account => {
                if(account){
                    account.state = 'reserved';
                    account.reservatedAt = new Date();
                    account.reservationToken = (Math.random() * 100000000000000000).toString(16);
                    account.save();
                    resolve({account:account,wait:0})
                }
                else resolve({ account:null, wait:1000 })
            })
            .catch(reject)
        })
    }



    Account.resetAccounts = () => {
        return new Promise((resolve,reject) =>{
            Account.find()
            .then(accounts=>{
                Promise.all(accounts.map(account=>account.unlock()))
                .then(result=>resolve(result))
                .catch(reject)
            }).catch(reject);
        })
    }

    Account.remoteMethod('available', {
        description: "get and reserve available account to send",
        http: {path: '/available', verb: 'get'},
        returns: {root: 'true', type: 'object'}
     });


     Account.remoteMethod('remoteSend', {
        isStatic: false,
        description: 'use this account to email pending send',
        http: {path: '/send/:sendId', verb: 'post'},
        accepts: [
            { arg:'sendId', type: 'string',required:true},
            { arg:'reservationToken', type: 'string',required:true}
        ],
        returns: { root: 'true', type: 'object' }
     });

     Account.remoteMethod('resetAccounts', {
        description: 'use this account to email pending send',
        http: {path: '/resetAccounts', verb: 'post'},
        returns: { root: 'true', type: 'array' }
     });
};
