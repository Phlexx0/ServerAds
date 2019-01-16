const Discord = require("discord.js");

const fs = require('fs');

var servers = {};

var bot = new Discord.Client();

const TOKEN = "";

const channelID = "440922444815925258"; 


var serverList = {servers: []}

bot.on("message", async message=>{
    if (channelID == message.channel.id) {
        if (message.content.startsWith("!serveradd")){
            //check for all fields
            var check = ["name:", "ip:", "type:", "link:","region:","config:"]
            let checkarr = []
            for(a in check){                
                //console.log(check[a],message.content)
                if (!message.content.toLocaleLowerCase().includes(check[a])){
                    checkarr.push(check[a]);

                };                
            };
            if (checkarr.length >= 1) {
                let checktostring = ""
                for(a in checkarr){
                    checktostring = checktostring+checkarr[a]+" ";
                    console.log(checktostring)
                };
                message.channel.send("Your message does not include **"+checktostring + "**\nPlease follow the format specified in pins. If you dont want to specify this field leave it blank")
            } 
            //end of check
            if (checkarr.length == 0){
            //console.log(message.content,message.content.match("/name:(.*?)ip:/"));
            var name = () => { 
              let name = message.content.match(/name:(.*?)ip:/i)[1].trim();
              
              if(name){ //rulez
                return name;
              }else{ 
                return "Not Specified";
              }
            };


            var ip = () => {
              let ip = message.content.match(/ip:(.*?)type:/i)[1].trim();
              if (ip.length == 0){
                return "Not specified";
              };
              let ipTest = new RegExp(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
              console.log(ip, ipTest.test(ip))
              if (ipTest.test(ip) && ip.length <=15){
                return ip;
              }else{
                return "Invalid input";
              };
            }


            var type =message.content.match(/type:(.*?)link:/i)[1].trim();


            var link = () => {
              let link = message.content.match(/link:(.*?)region:/i)[1].trim();
              if (link.length == 0){
                return "Not specified"
              };
              if (link.includes("www.battlemetrics.com/servers/scum/")){
                return link
              }else{
                return "Link doesnt contain Battlemetrics link"
              }
            };
            


            var region = () => {
              let region = message.content.match(/region:(.*?)config:/i)[1].trim();
              console.log("Region lennght:"+region.length)
              if (region.length >21){
                return "Invalid channel or multiple channels"
              }
              if (bot.channels.get(region.slice(2,-1))){
                return region;
              }else{
                return "Invalid/No channel selected";
              }
            };

            
            var conf =message.content.match(/config:?(.*)/i)[1].trim();


            let embed = {
              "title": "**Preview**",
              "footer": {
                "text": "Check pins for more information"
              },
              "fields": [
                {
                  "name": "Server name",
                  "value": name(), 
                  "inline": false
                },
                {
                  "name": "IP",
                  "value": ip(),
                  "inline": true
                },
                {
                  "name": "Type",
                  "value": type , 
                  "inline": true
                },
                {
                  "name": "Region",
                  "value": region() ,
                  "inline": true
                },
                {
                  "name": "Link",
                  "value": link() ,
                  "inline": false
                },

                {
                  "name": "Config",
                  "value": conf ,
                  "inline": false
                }
              ]
            };
            console.log(embed)
            message.channel.send({embed});



            }else{
              console.log("nice")
            };

    
            console.log(message.content);
        }

    }
    
})

var data={}; 
bot.on("messageReactionAdd", (reaction, user)=>{ //Add admin only permission
  console.log ("Reaction added")
  
  if(reaction.emoji.name === "✅"){
    var test = reaction.message.embeds[0].fields.forEach((field)=> {data[field.name.replace(" ", "_")] = field.value}) 
    
    console.log(test+ "\n\n")
    console.log(data)
    console.log(user.username)
  }
  updateJson()
})



function jsonCheck(){
  let test = JSON.stringify(serverList)
  if (fs.existsSync("list.json")){
    console.log("File exists");
  }else{
    fs.writeFileSync("list.json", test);
    console.log("Created file");
  }
}

function updateJson(){
  serverList.servers.push(data);
  console.log(serverList)
  let test = JSON.stringify(serverList)
  let jsonParse = fs.writeFileSync("list.json", test)
  data = {}
  //this is confusing
  //serverList = JSON.parse(jsonParse)


}

bot.on("ready", function(){
  jsonCheck();
  let jsonParse = fs.readFileSync("list.json", "utf8");
  serverList = JSON.parse(jsonParse);
  console.log(serverList)
})




bot.login(TOKEN);
