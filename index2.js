const express = require('express');
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const fs = require('fs')
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('cars.txt'),
    crlfDelay: Infinity
});

const app = express();
const port = 3000;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.get('/', (req, res) => {

    // RETRIVE INFORMATION FROM REQUEST
    res.send('MAIN MENU');
});

// Show information of cars
app.get('/cars', (req, res) => {

    let cars_list = getCars();
    res.send(cars_list);
});

app.post('/cars', (req, res) => {
    // RETRIVE INFORMATION FROM REQUEST
    let vin = req.body.vin;
    let model = req.body.model;
    let make = req.body.make;
    let year = req.body.year;
    let color = req.body.color;
    let km = req.body.km;
    let price = req.body.price;
    let image1 = req.body.image1;
    let image2 = req.body.image2;
    let image3 = req.body.image3;
    let image4 = req.body.image4;

    //user = String.toString(user);
    //console.log('El user es:',user);
    //let exists = userExists(user);

    if (false) {
        //user already registered
        res.send("User already registered, try with a different username <br> <button type='button' onclick='history.go(-1)'>Go back</button>");
    }
    else {
        registerCar(vin,model,make,year,color,km,price,image1,image2,image3,image4);
        res.send("New User registered succesfully <br> <button type='button' onclick='history.go(-2)'>Go to index</button>");
    }
    // Saving information to local text file.

    //res.send('user: ' + user + ' passsword +: ' + password);

})

app.get('/cars/:id',(req,res)=>{

    let searchedId = req.params.id;
    let theCar = findCar(searchedId);
    if(theCar.length > 0) res.send(theCar);
    else res.send('Car does not exist');
    

})

//REMOVE CAR
app.delete('/cars/:id',(req,res)=>{

    let searchedId = req.params.id;
    let theCar = findCar(searchedId);
    if(theCar.length > 0) res.send(theCar);
    else res.send('Car does not exist');
    

})

app.post('/login', (req, res) => {
    
    // RETRIVE INFORMATION FROM REQUEST
    let user = req.body.username;
    let password = req.body.password;

    if(isValidUser(user,password)) {
        res.send("Login succesful <br> <button type='button' onclick='history.go(-2)'>Go to index</button>");
    }
    else res.send("Invalid credentials <br> <button type='button' onclick='history.go(-1)'>Go back</button>");

})



// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ------------ FUNCTIONS -------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

function getCars()
{

    const data = fs.readFileSync('cars.txt','utf-8');
    let lines = data.split('\r\n');
    //console.log(lines);
    //console.log(data);
    cars = [];
    for ( let i = 0; i < lines.length; i++)
    {
        let info = lines[i].split(',');
        cars[i] = {
            vin: info[0],
            model: info[1],
            make: info[2],
            year: info[3],
            color: info[4],
            km: info[5],
            price: info[6],
            image1: info[7],
            image2: info[8],
            image3: info[9],
            image4: info[10]
        }
    }
    //To store cars in .txt we create a line skip at the end, creating an empty line at the end so the array contains an undefined car.
    // We remove the last object of the cars array
    cars.pop();
    //console.log(cars);

    return cars;
    
}

function registerCar(vin,model,make,year,color,km,price,image1='',image2='',image3='',image4=''){

    let newData = vin+','+model+','+make+','+year+','+color+','+km+','+price+','+image1+','+image2+','+image3+','+image4+"\r\n";
    //let newData = user+','+password+"\r\n";
    // let totalData = data+newData;
    try {
        fs.appendFileSync('cars.txt',newData);
    } catch (error) {
        console.log('Error while registering new car');
        console.log(e);
    }
    
}

function findCar(vinNum)
{
    let cars = getCars();
    console.log('searched vin is', vinNum);
    theCar = cars.filter( (aCar) => aCar.vin == vinNum )
    return theCar;
    
}

function userExists(user){
    let searched = user+',';
    const data = fs.readFileSync('myDb.txt','utf-8');
    //console.log(data);
    found = false;
    let position = (data.indexOf(searched));
    position == -1? found= false: found=true;
    return found;
}



function isValidUser(user,password)
{
    let isValid = false;
    const data = fs.readFileSync('myDb.txt','utf-8');

    //Find user
    let searched = user+',';
    let position = (data.indexOf(searched));
    let name_len = searched.length;
    let passwordlen = data.indexOf("\r\n",position) - (position+name_len);
    
    //Get password of user from db
    let password_Db = data.substring(position+name_len,position+name_len+passwordlen);
    
    (password_Db == password)? isValid = true : isValid = false;

    console.log(password_Db);
    console.log(password_Db.length);

    return isValid;


}

function readFile(){
    const data = fs.readFileSync('myDb.txt','utf-8');
    console.log(data);
    console.log(data.indexOf('Andreas,'));
}
app.listen(port);
console.log('listening on port ' + port);


