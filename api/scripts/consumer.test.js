var kafka = require('kafka-node');



const Consumer = kafka.ConsumerStream;
const Admin = kafka.Admin;


const client = new kafka.KafkaClient(
  { 
    kafkaHost: 'kafka:29092'
  }
);
client.on('error',(error)=>console.log(error));




const admin = new Admin(client); // client must be KafkaClient
admin.listGroups((err, res) => {
  console.log('consumerGroups', err,res);
});





consumer = new Consumer(
  client,
  [
      { topic: 'tasks'}
  ],
  {
      autoCommit: true, groupId:'hola', id:'aaa'
  }
);

consumer.resume();
consumer.on('message', function (message) {
    consumer.pause();
 

    console.log("message",message.offset);


    setTimeout(()=>{
        console.log("terminado",message.offset);
        consumer.resume();
    },1000);


});


consumer.on('offsetOutOfRange', function (topic) {
    console.log(topic);
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
      if (err) {
        return console.error(err);
      }
      var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
      consumer.setOffset(topic.topic, topic.partition, min);
    });
  });