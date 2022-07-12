fetch('http://localhost:3001/MongoData')
.then(response => response.json())
.then(data => console.log(data));
