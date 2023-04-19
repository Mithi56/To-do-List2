//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { name } = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shajiaparveen5:shakibjana@cluster0.qcoi9or.mongodb.net/todolistDB");

const itemsSchema ={
  name: String
}


const Item= mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the todolist"
})
const item2 = new Item({
  name: "Click the + button to add item"
})
const item3 = new Item({
  name: "<--Hit this to delete an item"
})

const defaultItems= [item1,item2,item3];

const listSchema ={
  name: String,
  item: [itemsSchema]
}

const List = mongoose.model("List",listSchema);






app.get("/", function(req, res) {

  Item.find()
  .then(function(founditems){
    if(founditems.length===0){
      Item.insertMany(defaultItems)
  .then(function(){
    console.log("succesfully inserted!");
  })
  .catch(function(err){
    console.log("err");
  });
   res.redirect("/");
  
    }else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    
    }

  })
  .catch(function(err){
    console.log("err");
  })

  

  



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =req.body.list;

  const item4 = new Item({
    name: itemName

  })

  if(listName==="Today"){

    item4.save();
    res.redirect("/");

  }else{
    List.findOne({name:listName}) 
    .then(function(founditems){
      founditems.item.push(item4);
      founditems.save();
      res.redirect("/"+ listName);
    })
    .catch(function(err){
      console.log("err");
    })
  }

  
});

app.post("/delete",function(req,res){
  const checkedId= req.body.checkbox;
  const listId = req.body.listName;

  if(listId==="Today"){
    Item.findByIdAndRemove(checkedId)
  .then(function(){
    console.log("Successfully deleted!");
    res.redirect("/");
  })
  .catch(function(err){
    console.log("err");
  })

  }else{
    List.findOneAndUpdate({name: listId},{$pull:{item:{_id:checkedId}}})
    .then(function(){
      res.redirect("/"+ listId);
    })
    .catch(function(err){
      console.log("err");
    })
  }
  
})
app.get("/:pageName",function(req,res){
  const pagename= _.capitalize(req.params.pageName);
  

  List.findOne({name: pagename})
  .then(function(founditems){
    if(founditems){
      res.render("list", {listTitle: founditems.name , newListItems: founditems.item});
    }
        else{
          const list = new List({
            name: pagename,
            item: defaultItems
          });
          list.save();
        res.redirect("/"+ pagename);}

        }

    )
    

    
      .catch(function(err){
      console.log("err");


    })
      
  })


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
