import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component
{

  constructor(props)
  {
    super(props);

    this.state = {ServerUpTime: "N/A",
      SystemUpTime: "N/A",
      LocalDate: "N/A",
      MemoryUsage: "N/A",
      CPU_Usage: "N/A"};
  }

  componentDidMount()
  {
    //this.RetreiveB();
    this.RetreiveData();
    this.requestTimer = setInterval(() => {this.RetreiveData();}, 60000);
  }

  componentWillUnmount()
  {
    clearInterval(this.requestTimer);
  }

  RetreiveData = async () => {
    const res = await fetch('http://localhost:3001/A');
    const json = await res.json();

    this.state.ServerUpTime = json.ServerUpTime;
    this.state.SystemUpTime = json.SystemUpTime;
    this.state.LocalDate = json.LocalDate;
    this.state.MemoryUsage = json.MemoryUsage;
    this.state.CPU_Usage = json.CPU_Usage;

    this.setState({state: this.state});
    console.log(json);
    return json;
  }

  RetreiveB = async () => {
    const res = await fetch('http://localhost:3001/A');
    const json = await res.json();
    console.log(json);
  }

render()
{
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p> ServerUpTime: {this.state.ServerUpTime} </p>
        <p> SystemUpTime: {this.state.SystemUpTime} </p>
        <p> Local Date/Time: {this.state.LocalDate} </p>
        <p> Memory Usage: {this.state.MemoryUsage}% </p>
        <p> CPU Usage: {this.state.CPU_Usage}% </p>
      </header>
    </div>
  );
}
}



export default App;
