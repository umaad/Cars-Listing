const express = require('express');
const bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const fs = require('fs')
const readline = require('readline');
const path = require('path');


const rl = readline.createInterface({
    input: fs.createReadStream('cars.txt'),
    crlfDelay: Infinity
});

var exphbs = require('express-handlebars');

const app = express();
const port = 3000;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
const cors = require('cors');
app.use(cors());
// parse application/json
app.use(bodyParser.json())



// HANDLEBARS USAGE
app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Setup the static folder that static resources can load from
// like images, css files, etc.
app.use(express.static("static"));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));



// -------------------------------------------------------------
// --------- API ENDPOINTS -------------------------------------
// -------------------------------------------------------------

app.get('/', (req, res) => {

    // RETRIVE INFORMATION FROM REQUEST
    res.render("main", { layout: false });

});

// Show information of cars
app.get('/cars', (req, res) => {

    let cars_list = getCars();
    //res.send(cars_list);
    res.render('carsdisp', { cars: cars_list, layout: false })
    //res.sendFile(path.join(__dirname+'/carsDisplay.html'));
});

//Page to render the create car template
app.get('/create', (req, res) => {
    res.render('create', { layout: false });
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

    newCar = {
        "vin": req.body.vin,
        "model": req.body.model,
        "make": req.body.make,
        "year": req.body.year,
        "color": req.body.color,
        "km": req.body.km,
        "price": req.body.price,
        "image1": req.body.image1 || "",
        "image2": req.body.image2 || "",
        "image3": req.body.image3 || "",
        "image4": req.body.image4 || ""
    }
    let result = registerCar(newCar);
    if (result == -1) {
        res.send("Error registering car")
    }
    else if (result == 0) {
        res.send("Car already registered, please try again <br> <a href='http://localhost:3000/cars'>Go to cars</a>")
    }
    else { let cars_list = getCars();
        //res.send(cars_list);
        res.render('carsdisp', { cars: cars_list, layout: false }) }


})

// GET CAR
app.get('/cars/:id', (req, res) => {

    let searchedId = req.params.id;
    let theCar = findCar(searchedId);
    //if (theCar.length > 0) res.send(theCar);
    if (theCar.length > 0) res.render('cardetails', { car: theCar[0], layout: false });
    else res.send('Car does not exist');


})

//EDIT VIEW
app.get('/cars/:id/edit', (req, res) => {
    console.log('entro edit')
    let searchedId = req.params.id;
    let theCar = findCar(searchedId);
    if (theCar.length > 0) res.render('caredit', { car: theCar[0], layout: false });
    else res.send('Car does not exist');


})


// EDIT CAR
app.post('/cars/:id/edit', (req, res) => {
    let searchedId = req.params.id;

    editedCar = {
        "vin": req.body.vin,
        "model": req.body.model,
        "make": req.body.make,
        "year": req.body.year,
        "color": req.body.color,
        "km": req.body.km,
        "price": req.body.price,
        "image1": req.body.image1,
        "image2": req.body.image2,
        "image3": req.body.image3,
        "image4": req.body.image4
    }

    let result = editCar(searchedId, editedCar);

    if (result == 1) {
        let cars_list = getCars();
        //res.send(cars_list);
        res.render('carsdisp', { cars: cars_list, layout: false })
    }
    else {
        res.send("CAR NOT FOUND <br> <a href='http://localhost:3000/cars'>Go to cars</a>");
    }


})


//REMOVE CAR
app.delete('/cars/:id', (req, res) => {

    let searchedId = req.params.id;

    let result = deleteCar(searchedId);
    if (result == -1) res.send("Error deleting car");
    if (result == 0) res.send("Car does not exist");
    if (result == 1) res.send("Car deleted succesfully <br> <a href='http://localhost:3000/cars'>Go to cars</a>");


})





// ----------------------------------------------------------------
// ----------------------------------------------------------------
// ------------ FUNCTIONS -------------
// ----------------------------------------------------------------
// ----------------------------------------------------------------

function getCars() {

    const rawdata = fs.readFileSync('cars.json');
    let cars = JSON.parse(rawdata)
    console.log(cars);
    return cars;

}

//Check if car exists
function carExists(vinNum) {
    let cars = getCars();
    theCar = cars.filter((aCar) => aCar.vin == vinNum)
    if (theCar.length > 0) return true;
    else return false;

}

function registerCar(newCar) {

    if (carExists(newCar.vin)) return 0;

    let cars = getCars();


    try {
        cars.push(newCar);
        let data = JSON.stringify(cars);
        fs.writeFileSync('cars.json', data);
        //console.log('newcars array,', cars);
        return 1;
    } catch (error) {
        console.log(error);
        return -1;
        //console.log(e);
    }

}

function findCar(vinNum) {
    let cars = getCars();
    console.log('searched vin is', vinNum);
    theCar = cars.filter((aCar) => aCar.vin == vinNum)
    return theCar;

}

function deleteCar(vinNum) {
    if (!carExists(vinNum)) return 0;

    let cars = getCars();

    let newArray = cars.filter((aCar) => aCar.vin != vinNum);

    try {

        let data = JSON.stringify(newArray);
        fs.writeFileSync('cars.json', data);

        return 1;
    } catch (error) {
        console.log(error);
        return -1;
        //console.log(e);
    }


}

//this function edits the car data


function editCar(vinNum, editedCar) {


    let cars = getCars()
    const indexFunc = (aCar) => aCar.vin == vinNum;
    let index = cars.findIndex(indexFunc);

    if (index >= 0) {
        cars[index] = editedCar;
        let newArray = cars;
        try {

            let data = JSON.stringify(newArray);
            fs.writeFileSync('cars.json', data);

            return 1;
        }
        catch (error) {
            return -1;
        }

    }
    else {
        return -1;
    }


}



app.listen(port);
console.log('listening on port ' + port);


