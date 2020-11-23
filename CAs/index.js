const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require("mongodb");

// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://root:root@testdatabase.bvwgz.mongodb.net/EpicBoss?retryWrites=true&w=majority"
const client = new MongoClient(url, { useUnifiedTopology: true });
 
// database name
var dbName = "EpicBoss";

const bodyParser = require('body-parser');
const { callbackify } = require('util');
app.use(bodyParser.urlencoded({ extended: false}))

let db, bossDb;

run().catch(console.dir);


//home page route
app.get('/', (req, res) => { 
    // console.log(bossDb)
    res.send('Hello Boss Fan. \n \n Today We going to insert the best games bosses. \n \n Enjoy \n \n Tiago')
    console.log("sending a message. The address http://localhost:3000/ return the message \"Hello World - Tiago\" .")
})

/**
 * Getting the boss by name
 * @param name
 * */
app.get('/boss/:name', (req, res) => {
    console.log('You are searching for you boss');
         
    async function findBoss() {
        console.log('Searching for the boss name: ' + req.params.name);
        const boss = await bossDb.findOne({"name": String(req.params.name)})

        if (boss === null || boss === undefined) {
            res.send("I do not know that one. \n Is he strong? \n Please insert him... =D");
        } else {                        
            res.json(boss)
        }
        //
    };
    findBoss();

})

/**
 * Inserting a boss
 * @param name
 * @param level
 * @param cruel
 * @param weapon
 * */
app.post('/boss/:name/:game/:level/:cruel/:weapon', (req, res) =>{
    console.log('The boss is name: ' + req.params.name + " game: " +req.params.game 
        + " level: " + req.params.level + " cruel: " + req.params.cruel
        + " weapon: " + req.params.weapon);
    //Creating the object boss
    let boss = new Boss(req.params.name, req.params.game, req.params.level, req.params.cruel, req.params.weapon)
    //insert it to the database
    console.log(boss);
    bossDb.insertOne(boss)
    res.sendStatus(200)
})


/**
 * @author Tiago Rufino
 * Boss update
 * url - localhost:3000/boss/name/game/level/cruel/weapon
 */
app.put('/boss/:name/:game/:level/:cruel/:weapon', (req, res) => {
    console.log(' Updating the boss ');
    async function findBoss() {
        try{
            const foundBoss = await bossDb.findOne({"name": String(req.params.name)})
            //if the boss is found edit it and send a message to the user
            console.log(foundBoss);
            if(foundBoss !== null){
                console.log("insight the if")
                let boss = new Boss(
                                req.params.name,
                                req.params.game,
                                req.params.level,
                                req.params.cruel,
                                req.params.weapon)
                console.log(boss);
                try{
                    var whereConditional = {"name": String(req.params.name)};
                    var newValues =  {$set:boss}
                    const updateResult = await bossDb.updateOne(whereConditional, newValues);
                    // Was inserted insight of the try because the error when commit
                    console.log(updateResult.modifiedCount)       
                    res.send("The boss was updated");
                } catch(err){
                    console.log(err.stack)
                    console.log("After insight catch")
                }                            
            } else {
                //if the boss is not found send a message to the user saying that this entry doe not exist
                res.send("I did not find your boss. Plese try again.");
            }
        }catch(err){
            console.log(err.stack)
            res.send("Error update")
        }
    };
    findBoss();

})

/** 
 * Boss delete
 */
app.delete('/boss/', (req, res) =>{

    console.log('Deleting a boss');

    console.log(req.body.id)

    bossDb.deleteOne({"_id": ObjectId(req.body.id)})
    async function findBoss() {
        const foundBoss= await  bossDb.findOne({"_id": ObjectId(req.body.id)})
        if(foundBoss !== null){
            res.send("The entry was not deleted")
        }
        res.send("The entry was deleted")
    };
    findBoss();
})


//code used to start our application
async function run() {
    // try to start the application only if the database is connected correctly
    try {
        //connect to the database
        await client.connect();
        
        //connect to the right database ("dealership")
        db = client.db(dbName);

        //get reference to our boss "table"
        bossDb = db.collection("boss");

        //start listening to requests (get/post/etc.)
        app.listen(3000);
    } catch (err) {
        //in case we couldn't connect to our database throw the error in the console
         console.log(err.stack);
    }    
}

/**
 * Boss classe.
 * 
 * @author Tiago Rufino 
 */
class Boss {
    
    constructor(name, game, level, cruel = false, weapon){
        this.name = name;
        this.game = game;
        this.level = level;
        this.cruel = cruel;
        this.weapon = weapon;
    }    

    printValues(){
        console.log(this.name, this.game, this.level, this.cruel, this.weapon);
        return this.name + " " + this.game + " " + this.level + " " + this.cruel + " " + this.weapon
    }

    static comparator(boss1, boss2){
        var boss = new Boss();
        if (boss1.name !== boss2.name)
            boss.name = boss1.name;
        
        if (boss1.game !== boss2.game)
            boss.game = boss1.game;
        
        if (boss1.level !== boss2.level)
            boss.level = boss1.level;
        
        if (boss1.cruel !== boss2.cruel)
            boss.cruel = boss1.cruel;
        
        if (boss1.weapom !== boss2.weapon)
            boss.weapon = boss1.weapom;
        
        return boss;
    }
}