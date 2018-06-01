//inport module
const Twitter = require('twitter');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const escpos = require('escpos');

//set config
const config = require(path.join(__dirname, '/data/config.json'));

//set device
const vid = parseInt(config.vid,16);
const pid = parseInt(config.pid,16);
const device  = new escpos.USB(vid,pid);

//set option
const options = { encoding: "GB18030" };
const printer = new escpos.Printer(device, options );
const client = new Twitter({
  consumer_key: config.consumerKey,
  consumer_secret: config.consumerSecret,
  bearer_token: config.bearerToken
});


async function getIcon(url)
{
	const res = await axios.get(url, {responseType: 'arraybuffer'});
	fs.writeFileSync( path.join(__dirname, '/data/icon.jpg') , new Buffer.from(res.data), 'binary');
}

async function printCard(name,screenName,description)
{
	
	try{
		device.open( function () {
			printer.text('---  BEGIN PROFILE ---\n')

			printer.feed(1);
			printer.print('\x1b\x52\x08')
			printer.print('\x1b\x74\x01')
			printer.print('\x1c\x43\x01')
			printer.encode("Shift_JIS");
			printer.text(name);
			printer.feed(1);
			printer.text("@"+screenName);
			printer.feed(1);
			printer.text(description);
			printer.feed(1);
			
				
			
			printer.text('---  END PROFILE ---\n')
			printer.feed(1)
			printer.cut();
			printer.close();
				

		});	
	} catch (err){
		return console.error(`error: ${err}`);
	}
}

async function createCard(id)
{
	try {
		const profile = await client.get("users/show",{"screen_name":id});
		const iconUrl = profile.profile_background_image_url_https;
		const description = profile.description;
		const name = profile.name;
		const screenName = profile.screen_name;
		getIcon(iconUrl);
		printCard(name,screenName,description);
	} catch (err){
		return console.error(`error: ${err}`);
	}
}


createCard("soralis_nem").catch(
  err => console.error(`error: ${err}`)
);

