// 'use strict';


// var kafka = require('kafka-node');
// // const Consumer = kafka.ConsumerStream;

// // const client = new kafka.KafkaClient({kafkaHost: 'kafka:29092',
// // connectTimeout: 100,
// // requestTimeout: 100});


// const WAIT_FOR_RETRY = 10 * 1000;  // 10 seconds in miliseconds 


// /**
//  * Listen to kafka topic "tasks" with sendMail group
//  * on message ... wait for account available
//  * 
//  */


// module.exports = function mailerConsumer(server) {
//    console.log('mailer consumer listeners start ');

//     var options = {
//         // connect directly to kafka broker (instantiates a KafkaClient)
//         kafkaHost: 'kafka:29092',
//         groupId: 'sendMail',
//         autoCommit: true,
//         autoCommitIntervalMs: 5000,
//         sessionTimeout: 15000,
//         fetchMaxBytes: 10 * 1024 * 1024, // 10 MB
//         // An array of partition assignment protocols ordered by preference. 'roundrobin' or 'range' string for
//         // built ins (see below to pass in custom assignment protocol)
//         protocol: ['roundrobin'],
//         // Offsets to use for new groups other options could be 'earliest' or 'none'
//         // (none will emit an error if no offsets were saved) equivalent to Java client's auto.offset.reset
//         //fromOffset: 'latest',
//         // how to recover from OutOfRangeOffset error (where save offset is past server retention)
//         // accepts same value as fromOffset
//         outOfRangeOffset: 'earliest'
//     };

//     var consumer = new kafka.ConsumerGroupStream(options, 'tasks');
    
//     // const client = new kafka.KafkaClient(
//     //   { 
//     //     kafkaHost: 'kafka:29092'
//     //   }
//     // );
    
//     // client.on('error',(error)=>console.log(error));
    
//     // var topics = [{
//     //     topic: 'tasks',
//     //     partitions: 60,
//     //     replicationFactor: 1
//     // }];
       

//     // client.createTopics(topics, (error, result) => console.log(error,result));


//     //server.kafkaClient = client;

//     // const consumer = new Consumer(
//     //     client,
//     //     [
//     //         { topic: 'tasks' }
//     //     ],
//     //     {
//     //         groupId: 'sendMail'
//     //     }
//     // );
   

//     //consumer.resume();
//     consumer.on('message', function (message) {
//         console.log(message.offset, 'task message')
//         //consumer.pause();
//         try{
//             var data = JSON.parse(message.value);
//             var next = function(){
//                 server.models.Account.getAvailable()
//                 .then(account=>{
//                     if(account){
//                         server.models.Send.findById(data.sendId)
//                             .then(
//                                 (send) =>{ 
//                                            if (send) account.send(send)
//                                                             .then(()=>consumer.resume())
//                                                             .catch(()=>consumer.resume());
//                                            else account.unlock().then(()=>consumer.resume());
//                                          }
//                             )
//                             .catch(
//                                 (error) => {
//                                             console.log('send not found: ' + data.sendId)
//                                            }
//                             )
//                     }else{
//                         consumer.setOffset('tasks',message.partition,message.offset);
//                         console.log(message.offset, 'waiting for send');
//                         setTimeout(()=>{
//                             consumer.resume();
//                         },WAIT_FOR_RETRY)
//                     }
//                 });
//             }
//             next();
//         }catch(error){
//             console.log(error.message);
//             consumer.resume();
//         }
         
            

//     });


// };
