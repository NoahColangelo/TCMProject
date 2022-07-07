import React from "react";
import ReactDOM from "react-dom";
import Info from "./snmpFunc";

const hi = Info;

const element = <h1>Hello World, {hi}</h1>
console.log(element);

ReactDOM.render(element, document.getElementById('root'));