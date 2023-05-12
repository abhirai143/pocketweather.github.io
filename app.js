require("dotenv").config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const ejs = require('ejs');

const app = express();

app.use(bodyParser.urlencoded({extened : true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));


mongoose.connect("mongodb+srv://"+process.env.USER_ID+":"+process.env.USER_KEY+"@cluster0.7nyopqj.mongodb.net/weatherDB", {useNewUrlParser:true});

const weatherSchema = new mongoose.Schema({
    temperature:String,
    detail:String,
    url:String,
    lat:String,
    long:String,
    city:String,
    country:String,
    tempmax:String,
    tempmin:String,
    hum:String,
    feel:String

  })
  
const Item = mongoose.model("Item", weatherSchema);
const dataList = [];

app.get("/",async function(req, res){
    let foundItem = (await Item.find({}).sort({_id: -1}).limit(1))[0];
    res.render("index", {dataItem:foundItem})

    
})

app.post("/", function(req, res){

    const cityName = req.body.city;
    const apiKey = process.env.API_KEY
    const unit = "metric"
    const Url ="https://api.openweathermap.org/data/2.5/weather?q="+cityName+"&appid="+apiKey+"&units="+unit

    https.get(Url, function(response){
        response.on("data", function(data){
            const weatherData = JSON.parse(data);
            const latitude=weatherData.coord.lat
            const longitude = weatherData.coord.lon
            const humid = weatherData.main.humidity
            const feel_like = weatherData.main.feels_like
            const temp_min = weatherData.main.temp_min
            const temp_max = weatherData.main.temp_max
            const name = weatherData.name
            const country = weatherData.sys.country

            const temp = weatherData.main.temp;
            const icon = weatherData.weather[0].icon;
            const icon_url = "http://openweathermap.org/img/wn/" +icon+ "@2x.png";
            const description = weatherData.weather[0].description;
            
            const items = new Item({
                temperature:temp,
                detail:description,
                url:icon_url,
                lat:latitude,
                long:longitude,
                city:name,
                country:country,
                tempmax:temp_max,
                tempmin:temp_min,
                hum:humid,
                feel:feel_like
            })
            items.save()

            
            res.redirect("/")
           
    })

})

})



app.listen(3000, function(){
    console.log("server is connection is seccussfull")
})