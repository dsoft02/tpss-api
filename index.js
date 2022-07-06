//importing the depenencies
const express=require('express');
const app=express();

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}..`));