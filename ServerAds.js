const Discord = require("discord.js");

const fs = require('fs');

var bot = new Discord.Client();

const TOKEN = "NTI1NjE2Nzc2OTIzNTc4MzY4.DyQFwA.SbCltMGAW63PlxExi3tiBSXUnw0";

const channelID = "440922444815925258";

const postInterval = 120; //14400 = 4h


var serverList = {
  servers: [],
  mainChannel: "",
  allowedRegions: []
}

bot.on("message", async message => {
  if (channelID == message.channel.id) {
    if (message.content.startsWith("!serveradd") ) {
      //check for all fields
      var check = ["name:", "ip:", "type:", "link:", "region:", "config:"]
      let checkarr = [];

      for (a in check) {
        //console.log(check[a],message.content)
        if (!message.content.toLocaleLowerCase().includes(check[a])) {
          checkarr.push(check[a]);

        };
      };

      if (checkarr.length >= 1) {
        let checktostring = ""
        for (a in checkarr) {
          checktostring = checktostring + checkarr[a] + " ";
          console.log(checktostring)
        };
        message.channel.send("Your message does not include **" + checktostring + "**\nPlease follow the format specified in pins. If you dont want to specify this field leave it blank")
      }
      //end of check
      console.log(message.content)
      if (checkarr.length == 0) {

        var name = () => {
          let name = message.content.replace(/\n/g, " ").match(/name:(.*?)ip:/i)[1].trim(); //Added newline fix

          if (name) { //rulez
            return name;
          } else {
            return "Not Specified";
          }
        };


        var ip = () => {
          let ip = message.content.replace(/\n/g, " ").match(/ip:(.*?)type:/i)[1].trim();
          if (ip.length == 0) {
            return "Not specified";
          };
          let ipTest = new RegExp(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
          console.log(ip, ipTest.test(ip))
          if (ipTest.test(ip) && ip.length <= 15) {
            return ip;
          } else {
            return "Invalid input";
          };
        }


        var type = message.content.replace(/\n/g, " ").match(/type:(.*?)link:/i)[1].trim();


        var link = () => {
          let link = message.content.replace(/\n/g, " ").match(/link:(.*?)region:/i)[1].trim();
          if (link.length == 0) {
            return "Not specified"
          };
          if (link.includes("www.battlemetrics.com/servers/scum/")) {
            return link
          } else {
            return "~~Doesnt contain Battlemetrics link~~"
          }
        };



        var region = () => {
          let region = message.content.replace(/\n/g, " ").match(/region:(.*?)config:/i)[1].trim();
          console.log("Region lenght:" + region.length)

          for (a in serverList.allowedRegions) {
            console.log(serverList.allowedRegions[a], region.slice(2, -1))
            if (region.length > 22 || (serverList.allowedRegions[a] != region.slice(2, -1))) {
              return "~~Invalid. Check !serverhelp to see allowed regions~~"
            }
          }

          if (bot.channels.get(region.slice(2, -1))) {
            return region;
          } else {
            return "~~Invalid/No channel selected~~";
          }
        };


        var conf = message.content.replace(/\n/g, " ").match(/config:?(.*)/i)[1].trim();

        for (i = 0; i < serverList.servers.length; i++) { //Check if ip already exists
          let server = serverList.servers[i];
          if (server.IP == message.content.replace(/\n/g, " ").match(/ip:(.*?)type:/i)[1].trim()) {
            message.channel.send("Server already exists.\n**Name:** " + server.Server_name + " **IP:** " + server.IP + " **Added by:** " + server.Added_by);
            return
          }
        };


        console.log(conf)


        let embed = {
          "title": "**Preview**",
          "footer": {
            "text": "Check pins for more information"
          },
          "fields": [{
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
              "value": type || "Not added",
              "inline": true
            },
            {
              "name": "Region",
              "value": region(),
              "inline": true
            },
            {
              "name": "Link",
              "value": link(),
              "inline": false
            },

            {
              "name": "Config",
              "value": conf || "No modifications",
              "inline": false
            },
            {
              "name": "Added by",
              "value": "Name: " + message.author.tag + " || ID:" + message.author.id, //"ID: " +message.author.id + " || Name: " + 
              "inline": false
            },
            {
              "name": "Permalink",
              "value": message.url,
              "inline": false
            },
          ]
        };

        console.log(embed)
        message.channel.send({
          embed
        });



      } else {
        console.log("nice")
      };


      console.log(message.content);
    }

  }

})

// Server add

bot.on("message", message => { //command for removing servers, ADD PERMISSION
  if (message.content.startsWith("!serverrem")) {
    let arg = message.content.slice(10, message.content.length).trim()

    let ipTest = new RegExp(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/); //Test IP input
    if (!(ipTest.test(arg)) || arg.length >= 15) {
      return message.channel.send("Invalid IP input");
    };

    for (i = 0; i < serverList.servers.length; i++) {
      let server = serverList.servers[i];
      console.log(message.author.id, arg)

      if ((server.IP == arg && server.Added_by.includes(message.author.id)) || (server.IP == arg && message.member.hasPermission("MANAGE_CHANNELS"))) {
        serverList.servers.splice(i, 1);
        message.channel.send("Server " + server.IP + " removed.");
        updateJson();
      } else if (!(server.IP == arg)) {
        message.channel.send("Server not found")
      } else if (server.IP == arg && !(server.Added_by.includes(message.author.id))) {
        message.channel.send("You do not have permission to delete this server. Only user who added the server can.")
      }
    }
  }
});

// Server find

bot.on("message", message => { //Command for finding servers by name or IP
  if (message.content.startsWith("!serverfind")) {
    let embed = new Discord.RichEmbed()
    let arg1 = message.content.slice(11, message.content.length).trim().toLocaleLowerCase();

    if (arg1.length == 0) {
      message.channel.send("Please type server name or IP after the command");
      return;
    }

    for (i = 0; i < serverList.servers.length; i++) {
      let server = serverList.servers[i];
      console.log(arg1)
      if (server.Server_name.toLocaleLowerCase().includes(arg1) || server.IP.includes(arg1) || server.Added_by.toLocaleLowerCase().includes(arg1)) { //Add user or ID search
        console.log("Found some")
        embed.addField("Servers:", "Name: " + server.Server_name + " \t IP: " + server.IP, false) //Add moar

      }
    }

    //checks if embed is empty
    if (embed.fields.length == 0) {
      message.channel.send("No server found")
    } else {
      message.channel.send(embed);
    };


  }
});

bot.on("message", message => {
  if (message.content.startsWith("!serverhelp")) {
    let embed = new Discord.RichEmbed()
    embed.setTitle("Help");
    embed.addField("!serveradd <syntax>", "Adds your server to auto post roster, for syntax check pins", false)
    embed.addField("!serverrem <ip>", "Removes your server from auto post roster. You can only remove the server you added")
    embed.addField("Currently allowed regions", listregions())
    message.channel.send(embed)
  }

})

// On reaction

var data = {};
bot.on("messageReactionAdd", (reaction, user) => { //Add admin only permission
  let check = reaction.message.guild.members.find(member => member.id == user.id).hasPermission("MANAGE_CHANNELS");
  console.log("Reaction added", check)
  //reaction.message.guild.members.find( member => member.id == user.id).hasPermission("MANAGE_CHANNELS"),  user.id)
  //let embed = new Discord.RichEmbed();
  if (reaction.emoji.name === "✅" && check) {
    var test = reaction.message.embeds[0].fields.forEach((field) => {
      data[field.name.replace(" ", "_")] = field.value
      //embed.addField(field.name,field.value,field.inline)
      //console.log(field.name)
    })
    data["lastTimePosted"] = 0
    data["nextPost"] = Math.round((new Date()).getTime() / 1000)
    console.log(test + "\n\n")
    console.log(user.username)
    try{
    bot.channels.get(data.Region.slice(2, -1)).send({
      embed: reaction.message.embeds[0]
    })}
    catch(error){
      console.log(error)
    }

  }
  serverList.servers.push(data);
  data = {}
  updateJson()
});

/* 
 ####################
 #  ADMIN COMMANDS  #
 ####################
 */

bot.on("message", message => { //server add main (main - channel where messages can be posted)
  if (message.content.startsWith("!serveram") && message.member.hasPermission("ADMINISTRATOR")) {
    let arg = message.content.slice(10, message.content.length)
    console.log(arg)
    serverList.mainChannel = arg;
    updateJson()
    message.channel.send("Added <#"+serverList.mainChannel+"> as main channel")
  }
});

bot.on("message", message => { //server remove main (main - channel where messages can be posted)
  if (message.content.startsWith("!serverrm") && message.member.hasPermission("ADMINISTRATOR")) {
    let arg = message.content.slice(10, message.content.length)
    console.log(arg)
    serverList.mainChannel = "";
    console.log(serverList)
    updateJson()
  }
});

bot.on("message", message => { //Adds a region that can be selected
  if (message.content.startsWith("!serverregionadd") && message.member.hasPermission("ADMINISTRATOR")) {
    let arg = message.content.slice(17, message.content.length)
    console.log()
    if (serverList.allowedRegions.length == 0) {
      serverList.allowedRegions.push(arg);
      updateJson();
      message.channel.send("Channel/region: <#" + arg + "> added")
      return;
    }
    for (i = 0; i < serverList.allowedRegions.length; i++) {
      if (serverList.allowedRegions[i] == arg) {
        message.channel.send("Channel already added.")
        return;
      }
    }
    serverList.allowedRegions.push(arg);
    updateJson()
    message.channel.send("Channel/region: <#" + arg + "> added")
  }
});

bot.on("message", message => { //Removes a region that can be selected
  if (message.content.startsWith("!serverregionrem") && message.member.hasPermission("ADMINISTRATOR")) {
    let arg = message.content.slice(17, message.content.length)
    for (i = 0; i < serverList.allowedRegions.length; i++)
      if (serverList.allowedRegions[i] == arg) {
        serverList.allowedRegions.splice(i, 1);
        updateJson()
        message.channel.send("Channel/region: <#" + arg + "> removed")
      }
  }
})

bot.on("message", message => { //Removes a region that can be selected
  if (message.content.startsWith("!servertimeadd") && message.member.hasPermission("ADMINISTRATOR")) {
    serverList.servers.forEach(server => {
      let rTime = Math.floor(Math.random() * 3600) + 1;
      server.nextPost = server.nextPost + rTime;
      console.log(server.nextPost, rTime);
      updateJson()
      console.log(server.nextPost)

    })
  }
})

function listregions() {
  let listregions = "";
  serverList.allowedRegions.forEach(region => {
    listregions = listregions + "<#" + region + ">"
  })
  return listregions;
}

bot.on("message", message => {
  if (message.content.startsWith("!serveradmin") && message.member.hasPermission("ADMINISTRATOR")) {

    let embed = new Discord.RichEmbed()
    embed.setTitle("Help")
    embed.addField("Added regions", listregions())
    embed.addField("Command channel", serverList.mainChannel || "None")
    embed.addField("Number of servers added", serverList.servers.length)
    embed.addBlankField(false)
    embed.addField("!serveram", "Adds command channel (only one possible)", false)
    embed.addField("!serverrm", "Removes command channel", false)
    embed.addField("!serverregionadd ", " Adds a channel that can be selected as valid region", false)
    embed.addField("!serverregionrem ", " removes a channel that can be selected as valid region", false)
    embed.addField("!servertimeadd ", "(DO NOT USE) Adds additional time until next post on all servers (additinoal time = 0sec-1h)", false)
    message.channel.send(embed)
  }

})




function postServer() {
  updateJson()
  if (serverList.servers.length == 0) {
    return
  }
  for (i = 0; i < serverList.servers.length; i++) {
    let server = serverList.servers[i];
    let embedFinal = new Discord.RichEmbed();
    let currentTime = Math.round((new Date()).getTime() / 1000)
    if (server.nextPost <= currentTime) {
      embedFinal.setTitle("**" + server.Server_name + "**")
      embedFinal.addField("IP", server.IP, true)
      embedFinal.addField("Type", server.Type, true)
      embedFinal.addField("Region", server.Region, true)
      embedFinal.addField("Link", server.Link, false)
      embedFinal.addField("Config", server.Config, false)
      embedFinal.addField("Added by", server.Added_by, false)
      try{
      bot.channels.get(server.Region.slice(2, -1)).send(embedFinal)
      }
      catch(error){
        console.log(error)
      }
      server.lastTimePosted = currentTime
      server.nextPost = currentTime + postInterval;
      updateJson()
    }
  }
  //bot.channels.get("440922444815925258").send("Posting this every 10seconds. Current time:"+ Math.round((new Date()).getTime() / 1000))
}
setInterval(postServer, 5000);



function jsonCheck() {
  let test = JSON.stringify(serverList)
  if (fs.existsSync("list.json")) {
    console.log("File exists");
  } else {
    fs.writeFileSync("list.json", test);
    console.log("Created file");
  }
}

function updateJson() {
  //serverList.servers.push(data);
  //console.log(serverList)
  let test = JSON.stringify(serverList)
  let jsonwrite = fs.writeFileSync("list.json", test)
  let jsonParse = fs.readFileSync("list.json", "utf8");
  serverList = JSON.parse(jsonParse);

  //this is confusing
  //serverList = JSON.parse(jsonParse)
}

bot.on("ready", function () {
  jsonCheck();
  let jsonParse = fs.readFileSync("list.json", "utf8");
  serverList = JSON.parse(jsonParse);
  console.log(serverList)
})

/*
TODO
Add permissions✅
Add radnom time interval to all nextpost (admin only command)✅
Add time,last time posted, time until next post ✅
Add instant post on reaction ✅
Solve embed issue when wrong region is selected
dont fuck up everything else 
*/

bot.login(TOKEN);
