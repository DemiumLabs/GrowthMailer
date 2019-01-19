'use strict';


    
var kafka = require('kafka-node');
const client = new kafka.KafkaClient({kafkaHost: 'kafka:29092',
connectTimeout: 100,
requestTimeout: 100});

const producer = new kafka.Producer(client);
producer.on('ready', function () {});



module.exports = function(Send) {

    Send.blockEmailLag = function(email){
        Send.find({where:{'to.email':email}}).then(sends=>{
            sends
            .map(send=>{
                if(send.state =='pending'){
                    send.state = 'blocked';
                    send.save(); 
                } 

            })
        });
        return Promise.resolve('process started');
    }

    Send.remoteMethod('blockEmailLag', {
        description: 'block pendings sends to this email',
        http: {path: '/blockEmailLag', verb: 'post'},
        accepts: [
            { arg:'email', type: 'string',required:true}
        ],
        returns: { root: 'true', type: 'string' }
     });

    Send.prototype.getTemplate = function(){
        return Send.app.models.Template.findById("5c2519199f2521002852abc1");
    }

    Send.prototype.setCrash = function(error){
        console.log("send error:" + this.id)
        this.state = "error";
        this.response = error;
        producer.send([{
            topic:'sendErrors',
            messages:[JSON.stringify({ sendId: this.id })]
        }],(err,res)=>{
            console.log(this.id,res);
        });
        this.save();
        return Promise.resolve(this);
    }


    Send.prototype.sendSuccess = function(response,account){
        console.log("send success:" + this.id);
        this.state = "success";
        this.response = response;
        this.accountId = account.id;
        producer.send([{
            topic:'sends',
            messages:[JSON.stringify({ sendId: this.id })]
        }],(err,res)=>{
            console.log(this.id,res);
        });
        this.save();
        return Promise.resolve(this);
       // return this.save();
    }


    Send.prototype.retry = function(){
        console.log("retry:" + this.id);
        this.state = "pending";
        producer.send([{
            topic:'tasks',
            messages:[JSON.stringify({ sendId: this.id })]
        }],(err,res)=>{
            console.log(this.id,res);
        });
        this.save();
        return Promise.resolve(this);
    }


    Send.retryPendings = function(){
        Send.find({where:{state:"pending"}})
        .then(sends=>{
                console.log('sends',sends.length);
                sends.map(send=>send.retry())
        });
        return Promise.resolve('launched');
    }


    Send.remoteMethod('retryPendings', {
        description: 'put in tasks topic all pending sends',
        http: {path: '/retryPendings', verb: 'post'},
        returns: { root: 'true', type: 'string' }
     });


    Send.observe('after save', function queueMail(ctx, next) {
        if(ctx.isNewInstance){
            producer.send([{
                topic:'tasks',
                messages:[JSON.stringify({ sendId: ctx.instance.id })]
            }],(err,res)=>{
                console.log(ctx.instance.id ,res);
                next();
            });
        }
    });


};
