'use strict';


    
var kafka = require('kafka-node');
const client = new kafka.KafkaClient({kafkaHost: 'kafka:29092',
connectTimeout: 100,
requestTimeout: 100});

const producer = new kafka.Producer(client);
producer.on('ready', function () {});



module.exports = function(Send) {


    Send.prototype.getTemplate = function(){
        return Send.app.models.Template.findById("5c25086fe0a7ed002b0f66fc");
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
